import 'package:flutter/material.dart';
import 'package:mobile/components/modalRegisterSymptoms.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../../services/symptom_log_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _symptomLogService = SymptomLogService();
  bool _isLoadingSummary = true;
  String? _summaryText;
  String? _summaryError;

  @override
  void initState() {
    super.initState();
    _loadSummary();
  }

  Future<void> _loadSummary() async {
    setState(() {
      _isLoadingSummary = true;
      _summaryError = null;
    });

    try {
      final logs = await _symptomLogService.listMine();
      if (!mounted) {
        return;
      }

      if (logs.isEmpty) {
        setState(() {
          _summaryText = 'Nenhum sintoma registrado ainda.';
        });
      } else {
        final latest = logs.first;
        final preview = latest.description.length > 80
            ? '${latest.description.substring(0, 80)}...'
            : latest.description;
        setState(() {
          _summaryText =
              'Último registro (${_formatDate(latest.createdAt)}): $preview';
        });
      }
    } on ApiException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _summaryError = error.message;
        _summaryText = null;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _summaryError = 'Não foi possível carregar seus registros.';
        _summaryText = null;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingSummary = false;
        });
      }
    }
  }

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    return '$day/$month/${date.year}';
  }

  Future<void> _showSymptomBottomSheet() async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return SymptomBottomSheet(onSaved: _loadSummary);
      },
    );

    if (saved == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sintoma registrado com sucesso.'),
          backgroundColor: Color(0xFF016B3A),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final displayName = user?.fullName ?? 'Paciente';

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF22A16C),
        elevation: 0,
        title: const Text(
          'Vitalium',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
          ),
        ),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Olá, $displayName',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF016B3A),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Paciente',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Como você está se sentindo hoje? Registre seus sintomas e acompanhe sua evolução.',
              style: TextStyle(fontSize: 14, color: Colors.black54),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _showSymptomBottomSheet,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF016B3A),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  '+ Registrar Sintomas',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              'Relatório',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey),
              ),
              child: _isLoadingSummary
                  ? const Row(
                      children: [
                        SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        SizedBox(width: 12),
                        Text('Carregando registros...'),
                      ],
                    )
                  : Text(
                      _summaryError ?? _summaryText ?? 'Sem registros.',
                      style: TextStyle(
                        fontSize: 14,
                        color: _summaryError != null
                            ? Colors.red.shade700
                            : Colors.black87,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
