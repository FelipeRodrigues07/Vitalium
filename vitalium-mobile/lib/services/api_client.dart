import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../core/config/api_config.dart';
import '../storage/auth_storage.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient(this._storage);

  final AuthStorage _storage;

  Future<http.Response> get(
    String path, {
    bool authenticated = true,
    bool retryOnUnauthorized = true,
  }) {
    return _send(
      () async => http.get(_uri(path), headers: await _headers(authenticated)),
      path: path,
      authenticated: authenticated,
      retryOnUnauthorized: retryOnUnauthorized,
    );
  }

  Future<http.Response> post(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = true,
    bool retryOnUnauthorized = true,
  }) {
    return _send(
      () async => http.post(
        _uri(path),
        headers: await _headers(authenticated),
        body: body == null ? null : jsonEncode(body),
      ),
      path: path,
      authenticated: authenticated,
      retryOnUnauthorized: retryOnUnauthorized,
    );
  }

  Future<http.Response> postMultipart(
    String path, {
    required Map<String, String> fields,
    required String fileField,
    required String filePath,
    String? fileName,
    bool authenticated = true,
    bool retryOnUnauthorized = true,
  }) {
    return _send(
      () async {
        final request = http.MultipartRequest('POST', _uri(path));
        request.headers.addAll(await _authHeaders(authenticated));
        request.fields.addAll(fields);
        request.files.add(
          await http.MultipartFile.fromPath(
            fileField,
            filePath,
            filename: fileName,
            contentType: _imageContentType(filePath, fileName),
          ),
        );

        final streamedResponse = await request.send();
        return http.Response.fromStream(streamedResponse);
      },
      path: path,
      authenticated: authenticated,
      retryOnUnauthorized: retryOnUnauthorized,
    );
  }

  Uri _uri(String path) {
    final normalized = path.startsWith('/') ? path : '/$path';
    return Uri.parse('${ApiConfig.baseUrl}$normalized');
  }

  Future<Map<String, String>> _headers(bool authenticated) async {
    final headers = await _authHeaders(authenticated);
    headers['Content-Type'] = 'application/json';
    return headers;
  }

  Future<Map<String, String>> _authHeaders(bool authenticated) async {
    final headers = <String, String>{
      'Accept': 'application/json',
    };

    if (authenticated) {
      final token = await _storage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<http.Response> _send(
    Future<http.Response> Function() request, {
    required String path,
    required bool authenticated,
    required bool retryOnUnauthorized,
  }) async {
    var response = await request();

    final isAuthRoute =
        path.contains('/auth/login') || path.contains('/auth/refresh');

    if (response.statusCode == 401 &&
        authenticated &&
        retryOnUnauthorized &&
        !isAuthRoute) {
      final refreshed = await _tryRefreshToken();
      if (refreshed) {
        response = await request();
      }
    }

    return response;
  }

  Future<bool> _tryRefreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      return false;
    }

    try {
      final response = await http.post(
        _uri('/auth/refresh'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        await _storage.clearSession();
        return false;
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final accessToken = data['accessToken'] as String?;
      if (accessToken == null || accessToken.isEmpty) {
        await _storage.clearSession();
        return false;
      }

      await _storage.saveAccessToken(accessToken);
      return true;
    } catch (_) {
      await _storage.clearSession();
      return false;
    }
  }

  static MediaType _imageContentType(String filePath, String? fileName) {
    String extensionOf(String value) {
      final dot = value.lastIndexOf('.');
      if (dot == -1 || dot == value.length - 1) {
        return '';
      }
      return value.substring(dot + 1).toLowerCase();
    }

    for (final candidate in [fileName, filePath]) {
      if (candidate == null || candidate.isEmpty) {
        continue;
      }

      switch (extensionOf(candidate)) {
        case 'jpg':
        case 'jpeg':
          return MediaType('image', 'jpeg');
        case 'png':
          return MediaType('image', 'png');
        case 'webp':
          return MediaType('image', 'webp');
        case 'heic':
          return MediaType('image', 'heic');
        case 'heif':
          return MediaType('image', 'heif');
      }
    }

    return MediaType('image', 'jpeg');
  }

  static String parseErrorMessage(http.Response response) {
    try {
      final data = jsonDecode(response.body);
      if (data is Map<String, dynamic>) {
        final message = data['message'];
        if (message is List) {
          return message.map((e) => e.toString()).join('\n');
        }
        if (message is String && message.isNotEmpty) {
          return message;
        }
      }
    } catch (_) {
      // ignore parse errors
    }

    if (response.statusCode == 401) {
      return 'Email ou senha inválidos.';
    }

    return 'Não foi possível concluir a operação (${response.statusCode}).';
  }
}
