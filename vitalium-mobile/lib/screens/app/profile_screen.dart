import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showOptionsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey[200],
                  child: Icon(
                    PhosphorIcons.image(),
                    color: Colors.grey[500],
                  ),
                ),
                title: const Text('Galeria'),
                onTap: () => Navigator.of(context).pop(),
              ),
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey[200],
                  child: Icon(
                    PhosphorIcons.camera(),
                    color: Colors.grey[500],
                  ),
                ),
                title: const Text('Câmera'),
                onTap: () => Navigator.of(context).pop(),
              ),
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey[200],
                  child: Icon(
                    PhosphorIcons.trash(),
                    color: Colors.grey[500],
                  ),
                ),
                title: const Text('Remover'),
                onTap: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sair'),
        content: const Text('Deseja encerrar sua sessão?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sair', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await context.read<AuthProvider>().logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final displayName = user?.fullName ?? 'Paciente';
    final email = user?.email ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Perfil',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF22A16C),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 75,
                  backgroundColor: Colors.grey[200],
                  child: const CircleAvatar(
                    radius: 65,
                    backgroundColor: Colors.grey,
                    child: Icon(Icons.person, size: 100, color: Colors.white),
                  ),
                ),
                Positioned(
                  bottom: 5,
                  right: 5,
                  child: CircleAvatar(
                    backgroundColor: Colors.grey[200],
                    child: IconButton(
                      onPressed: () => _showOptionsBottomSheet(context),
                      icon: Icon(
                        PhosphorIcons.pencilSimple(),
                        color: Colors.grey[400],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              displayName,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              email,
              style: const TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF016B3A),
                foregroundColor: Colors.white,
              ),
              child: const Text('Editar Perfil'),
            ),
            const SizedBox(height: 30),
            const Divider(),
            const SizedBox(height: 10),
            _profileMenuItem('Configurações', Icons.settings, () {}),
            _profileMenuItem('Informações', Icons.info, () {}),
            _profileMenuItem(
              'Sair',
              Icons.logout,
              () => _logout(context),
              textColor: Colors.red,
              endIcon: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _profileMenuItem(
    String title,
    IconData icon,
    VoidCallback onPress, {
    Color? textColor,
    bool endIcon = true,
  }) {
    return ListTile(
      leading: Icon(icon, color: textColor ?? Colors.black),
      title: Text(
        title,
        style: TextStyle(color: textColor ?? Colors.black),
      ),
      trailing: endIcon ? const Icon(Icons.arrow_forward_ios, size: 16) : null,
      onTap: onPress,
    );
  }
}
