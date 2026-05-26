/// URL base da API Vitalium.
///
/// Emulador Android: `http://10.0.2.2:3000`
/// Dispositivo físico: use o IP da máquina, ex.:
/// `flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3000`
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );
}
