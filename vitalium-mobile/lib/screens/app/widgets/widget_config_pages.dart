import 'package:flutter/material.dart';
import 'package:mobile/core/navigation/main_tab_controller.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/screens/app/chat_screen.dart';
import 'package:mobile/screens/app/home_screen.dart';
import 'package:mobile/screens/app/profile_screen.dart';
import 'package:mobile/screens/app/report_screen.dart';

class ConfigPage extends StatefulWidget {
  const ConfigPage({super.key});

  @override
  State<ConfigPage> createState() => _ConfigPageState();
}

class _ConfigPageState extends State<ConfigPage> {
  late final PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentPage);
    MainTabController.index.addListener(_onExternalTabChange);
  }

  @override
  void dispose() {
    MainTabController.index.removeListener(_onExternalTabChange);
    _pageController.dispose();
    super.dispose();
  }

  void _onExternalTabChange() {
    final target = MainTabController.index.value;
    if (target == _currentPage || !_pageController.hasClients) return;
    _pageController.animateToPage(
      target,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
    );
  }

  void _setCurrentPage(int page) {
    if (_currentPage == page) return;
    setState(() => _currentPage = page);
    MainTabController.index.value = page;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        onPageChanged: _setCurrentPage,
        children: const [
          HomeScreen(),
          ChatScreen(),
          ReportScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentPage,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: Colors.grey,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home_rounded),
            label: 'Início',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline_rounded),
            activeIcon: Icon(Icons.chat_bubble_rounded),
            label: 'Chat',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.insights_outlined),
            activeIcon: Icon(Icons.insights_rounded),
            label: 'Relatórios',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: 'Perfil',
          ),
        ],
        onTap: (page) {
          _pageController.animateToPage(
            page,
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeOutCubic,
          );
        },
      ),
    );
  }
}
