import 'package:flutter/foundation.dart';

import '../models/user_profile.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
}

class AuthProvider extends ChangeNotifier {
  AuthProvider({AuthService? authService})
      : _authService = authService ?? AuthService();

  final AuthService _authService;

  AuthStatus _status = AuthStatus.initial;
  UserProfile? _user;
  String? _errorMessage;

  AuthStatus get status => _status;
  UserProfile? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated =>
      _status == AuthStatus.authenticated && _user != null;

  Future<void> initialize() async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final profile = await _authService.restoreSession();
      if (profile != null) {
        _user = profile;
        _status = AuthStatus.authenticated;
      } else {
        _user = null;
        _status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      _user = null;
      _status = AuthStatus.unauthenticated;
    }

    notifyListeners();
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _errorMessage = null;
    _status = AuthStatus.loading;
    notifyListeners();

    try {
      _user = await _authService.login(email: email, password: password);
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } on ApiException catch (error) {
      _user = null;
      _status = AuthStatus.unauthenticated;
      _errorMessage = error.message;
      notifyListeners();
      return false;
    } catch (_) {
      _user = null;
      _status = AuthStatus.unauthenticated;
      _errorMessage =
          'Não foi possível conectar ao servidor. Verifique a URL da API e se o backend está rodando.';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _status = AuthStatus.unauthenticated;
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
