import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/symptom_log.dart';
import 'api_client.dart';
import '../storage/auth_storage.dart';

class SymptomLogService {
  SymptomLogService({
    AuthStorage? storage,
    ApiClient? apiClient,
  }) : _api = apiClient ?? ApiClient(storage ?? AuthStorage());

  final ApiClient _api;

  Future<SymptomLog> create({
    required String description,
    String? imagePath,
    String? imageFileName,
  }) async {
    final trimmed = description.trim();
    final http.Response response;

    if (imagePath != null && imagePath.isNotEmpty) {
      response = await _api.postMultipart(
        '/symptom-logs',
        fields: {'description': trimmed},
        fileField: 'image',
        filePath: imagePath,
        fileName: imageFileName,
      );
    } else {
      response = await _api.post(
        '/symptom-logs',
        body: {'description': trimmed},
      );
    }

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(
        ApiClient.parseErrorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return SymptomLog.fromJson(data);
  }

  Future<List<SymptomLog>> listMine() async {
    final response = await _api.get('/symptom-logs');

    if (response.statusCode != 200) {
      throw ApiException(
        ApiClient.parseErrorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final data = jsonDecode(response.body) as List<dynamic>;
    return data
        .map((item) => SymptomLog.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
