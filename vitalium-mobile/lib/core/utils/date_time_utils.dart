/// Utilitários de data/hora para respostas da API (UTC) exibidas em Brasília.
class DateTimeUtils {
  static const _brasiliaOffsetFromUtc = Duration(hours: 3);

  /// Interpreta string ISO da API como instante UTC.
  static DateTime parseApiUtc(String raw) {
    final value = raw.trim();
    final hasTimezone = value.endsWith('Z') ||
        RegExp(r'[+-]\d{2}:?\d{2}$').hasMatch(value);
    final normalized = hasTimezone ? value : '${value}Z';
    return DateTime.parse(normalized).toUtc();
  }

  /// Converte UTC para horário de Brasília (UTC−3, sem horário de verão).
  static DateTime toBrasilia(DateTime value) {
    return value.toUtc().subtract(_brasiliaOffsetFromUtc);
  }

  /// Formata hora:minuto no fuso de Brasília.
  static String formatHmBrasilia(DateTime value) {
    final br = toBrasilia(value);
    final hour = br.hour.toString().padLeft(2, '0');
    final minute = br.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
