import 'package:flutter/foundation.dart';

/// Controla a aba inferior do app do paciente.
class MainTabController {
  MainTabController._();

  static final ValueNotifier<int> index = ValueNotifier<int>(0);

  static void goTo(int page) {
    index.value = page;
  }

  static void goToChat() => goTo(1);
}
