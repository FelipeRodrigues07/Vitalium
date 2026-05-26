import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'widgets/auth_gate.dart';

class VitaliumApp extends StatelessWidget {
  const VitaliumApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Vitalium',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF22A16C)),
          useMaterial3: true,
        ),
        home: const AuthGate(),
      ),
    );
  }
}
