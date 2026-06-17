import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/screens/app/report_screen.dart';
import 'package:mobile/screens/app/home_screen.dart';
import 'package:mobile/screens/app/profile_screen.dart';
import 'package:mobile/screens/app/chat_screen.dart';


class ConfigPage extends StatefulWidget {
  const ConfigPage({super.key});

  @override
   _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<ConfigPage> {
  int paginaAtual = 0;
  late PageController pc;

  @override
  void initState() {
    super.initState();
    pc = PageController(initialPage: paginaAtual);
  }

  setPaginaAtual(pagina) {
    setState(() {
      paginaAtual = pagina;
    });
  }

  @override
  Widget build(BuildContext context) {
    

    return Scaffold(
      body: PageView(
        controller: pc,
        onPageChanged: (pagina) {
          setPaginaAtual(pagina); 
        },
        children: const [
          HomeScreen(),
          ChatScreen(),
          ReportScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: paginaAtual,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Início'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.insert_chart), label: 'Relatórios'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],

        onTap: (pagina) {
          
            pc.animateToPage(
              pagina,
              duration: const Duration(milliseconds: 400),
              curve: Curves.ease,
            );
        },
      ),
    );
  }
}
