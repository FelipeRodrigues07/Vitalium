import 'dart:convert';

import '../models/user_profile.dart';
import 'api_client.dart';
import '../storage/auth_storage.dart';

class AuthService {
  AuthService({
    AuthStorage? storage,
    ApiClient? apiClient,
  }) : _storage = storage ?? AuthStorage() {
    _api = apiClient ?? ApiClient(_storage);
  }

  final AuthStorage _storage;
  late final ApiClient _api;

  AuthStorage get storage => _storage;

  Future<UserProfile> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post(
      '/auth/login',
      body: {
        'email': email.trim(),
        'password': password,
      },
      authenticated: false,
      retryOnUnauthorized: false,
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(ApiClient.parseErrorMessage(response), statusCode: response.statusCode);
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = UserProfile.fromLoginJson(userJson);

    if (!user.isPatient) {
      throw ApiException(
        'Este aplicativo é apenas para pacientes. Use o painel web para outros perfis.',
      );
    }

    await _storage.saveSession(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
      user: user,
    );

    return user;
  }

  Future<UserProfile?> restoreSession() async {
    final token = await _storage.getAccessToken();
    if (token == null || token.isEmpty) {
      return null;
    }

    try {
      return await fetchProfile();
    } on ApiException {
      await _storage.clearSession();
      return null;
    }
  }

  Future<UserProfile> fetchProfile() async {
    final response = await _api.get('/auth/profile');

    if (response.statusCode != 200) {
      throw ApiException(ApiClient.parseErrorMessage(response), statusCode: response.statusCode);
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final user = UserProfile.fromProfileJson(data);

    if (!user.isPatient) {
      await _storage.clearSession();
      throw ApiException('Sessão inválida para o aplicativo do paciente.');
    }

    await _storage.saveUser(user);
    return user;
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {
      // logout no servidor é best-effort
    } finally {
      await _storage.clearSession();
    }
  }
}
