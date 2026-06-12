import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../services/api_client.dart';
import '../services/symptom_log_service.dart';

class SymptomBottomSheet extends StatefulWidget {
  const SymptomBottomSheet({super.key, this.onSaved});

  final VoidCallback? onSaved;

  @override
  State<SymptomBottomSheet> createState() => _SymptomBottomSheetState();
}

class _SymptomBottomSheetState extends State<SymptomBottomSheet> {
  final _descriptionController = TextEditingController();
  final _symptomLogService = SymptomLogService();
  final _imagePicker = ImagePicker();

  bool _isSubmitting = false;
  String? _errorMessage;
  String? _imagePath;
  String? _imageFileName;

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _imagePicker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1920,
      );

      if (picked == null || !mounted) {
        return;
      }

      setState(() {
        _imagePath = picked.path;
        _imageFileName = picked.name;
        _errorMessage = null;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = 'Não foi possível selecionar a imagem.';
      });
    }
  }

  Future<void> _showImageSourceSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Galeria'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_camera_outlined),
                title: const Text('Câmera'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _removeImage() {
    setState(() {
      _imagePath = null;
      _imageFileName = null;
    });
  }

  Future<void> _save() async {
    final description = _descriptionController.text.trim();

    if (description.length < 3) {
      setState(() {
        _errorMessage = 'Descreva o sintoma com pelo menos 3 caracteres.';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      await _symptomLogService.create(
        description: description,
        imagePath: _imagePath,
        imageFileName: _imageFileName,
      );

      if (!mounted) {
        return;
      }

      widget.onSaved?.call();
      Navigator.of(context).pop(true);
    } on ApiException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = error.message;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage =
            'Não foi possível salvar. Verifique sua conexão e tente novamente.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Registrar Sintomas',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: _isSubmitting
                    ? null
                    : () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            enabled: !_isSubmitting,
            decoration: InputDecoration(
              hintText: 'Digite seus sintomas aqui...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 12,
              ),
            ),
            maxLines: 4,
            textInputAction: TextInputAction.newline,
          ),
          const SizedBox(height: 10),
          if (_imagePath != null) ...[
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.file(
                    File(_imagePath!),
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: CircleAvatar(
                    radius: 16,
                    backgroundColor: Colors.black54,
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      icon: const Icon(Icons.close, color: Colors.white, size: 18),
                      onPressed: _isSubmitting ? null : _removeImage,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
          ElevatedButton.icon(
            onPressed: _isSubmitting ? null : _showImageSourceSheet,
            icon: const Icon(Icons.add_a_photo),
            label: Text(_imagePath == null ? 'Adicionar Imagem' : 'Trocar Imagem'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF016B3A),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          if (_errorMessage != null) ...[
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              style: const TextStyle(color: Colors.red, fontSize: 13),
            ),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _save,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF016B3A),
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Salvar',
                    style: TextStyle(color: Colors.white),
                  ),
          ),
        ],
      ),
    );
  }
}
