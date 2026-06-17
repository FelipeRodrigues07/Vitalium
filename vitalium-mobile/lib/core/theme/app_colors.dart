import 'package:flutter/material.dart';

/// Paleta alinhada ao painel web (vitalium-frontend/app/globals.css).
///
/// Os valores hex são a conversão dos tokens oklch do web para sRGB.
class AppColors {
  AppColors._();

  /// --primary: oklch(0.45 0.15 160) — esmeralda principal (botões, app bar).
  static const Color primary = Color(0xFF016B3A);

  /// Tom de pressionado/realce do primário.
  static const Color primaryStrong = Color(0xFF014E2B);

  /// --secondary / --accent: oklch(0.55 0.12 160) — esmeralda médio.
  static const Color secondary = Color(0xFF11865A);

  /// --primary-foreground: texto sobre o primário.
  static const Color onPrimary = Color(0xFFFFFFFF);

  /// --foreground: texto principal.
  static const Color foreground = Color(0xFF3A3A3A);

  /// --muted-foreground: texto secundário.
  static const Color mutedForeground = Color(0xFF717171);

  /// --background.
  static const Color background = Color(0xFFFFFFFF);

  /// --card.
  static const Color card = Color(0xFFFAFAFA);

  /// --border.
  static const Color border = Color(0xFFE5E5E5);

  /// --destructive: oklch(0.55 0.2 25) — vermelho de erro.
  static const Color destructive = Color(0xFFC0392B);

  /// Fundo suave esverdeado para destaques (cards de resumo).
  static const Color primaryTint = Color(0xFFE0F2F1);
}
