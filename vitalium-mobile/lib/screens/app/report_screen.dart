import 'package:flutter/material.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final List<Map<String, String>> symptoms = const [
    {'date': '01 Set', 'severity': 'Leve', 'description': 'Dor de cabeça na parte frontal. Usei Tylenol.'},
    {'date': '10 Set', 'severity': 'Moderada', 'description': 'Dor latejante após reunião estressante.'},
    {'date': '18 Set', 'severity': 'Forte', 'description': 'Enxaqueca com sensibilidade à luz e náuseas.'},
    {'date': '25 Set', 'severity': 'Leve', 'description': 'Cansado e com dor leve no final do dia.'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF22A16C),
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "Relatório de Sintomas",
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Histórico de Dores de Cabeça (Dezembro)",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2F1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF016B3A), width: 1),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Resumo do Período",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF016B3A)),
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Total de dias relatados:", style: TextStyle(fontSize: 15)),
                      Text("4 dias", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Sintoma mais comum:", style: TextStyle(fontSize: 15)),
                      Text("Dor de Cabeça", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 30),
            
            const Text(
              "Registro Detalhado",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: symptoms.length,
              itemBuilder: (context, index) {
                final symptom = symptoms[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 2,
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                    leading: CircleAvatar(
                      backgroundColor: _getSeverityColor(symptom['severity']!),
                      child: Text(
                        symptom['date']!.split(' ')[0],
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                    title: Text(
                      "Intensidade: ${symptom['severity']!}",
                      style: TextStyle(fontWeight: FontWeight.bold, color: _getSeverityColor(symptom['severity']!)),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text(symptom['description']!),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                    onTap: () {
                      print('Detalhes do sintoma de ${symptom['date']}');
                    },
                  ),
                );
              },
            ),

            const SizedBox(height: 30),

            const Text(
              "Sugestões de Ação",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            
            _buildSuggestionCard(
              context,
              icon: Icons.local_hospital,
              title: "Consulte um Médico",
              subtitle: "Se as dores fortes persistirem (3 ou mais por mês), é fundamental agendar uma consulta.",
              color: Colors.red.shade100,
            ),
            _buildSuggestionCard(
              context,
              icon: Icons.wb_sunny,
              title: "Gerenciamento de Estresse",
              subtitle: "Note que o sintoma Moderado ocorreu após estresse. Tente 15 minutos de meditação diária.",
              color: Colors.blue.shade100,
            ),
            _buildSuggestionCard(
              context,
              icon: Icons.water_drop,
              title: "Hidratação e Dieta",
              subtitle: "Mantenha o consumo de água e evite alimentos gatilho conhecidos para prevenir crises.",
              color: const Color(0xFFE0F2F1),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(String severity) {
    switch (severity) {
      case 'Forte':
        return Colors.red;
      case 'Moderada':
        return Colors.orange.shade700;
      case 'Leve':
        return const Color(0xFF22A16C);
      default:
        return Colors.grey;
    }
  }

  Widget _buildSuggestionCard(BuildContext context, {required IconData icon, required String title, required String subtitle, required Color color}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF016B3A), size: 30),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF016B3A)),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 14, color: Colors.black87),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
