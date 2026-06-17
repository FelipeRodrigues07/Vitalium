import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/date_time_utils.dart';
import '../../models/chat_conversation.dart';
import '../../models/chat_message.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../../services/chat_service.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  static const _green = AppColors.primary;
  static const _darkGreen = AppColors.primaryStrong;
  static const _pollInterval = Duration(seconds: 4);

  final _chatService = ChatService();
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  Timer? _pollTimer;

  bool _isLoading = true;
  bool _isSending = false;
  String? _errorMessage;

  ChatConversation? _conversation;
  Map<String, String> _doctorNames = {};
  List<ChatMessage> _messages = [];

  @override
  void initState() {
    super.initState();
    _initChat();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  String? get _userId => context.read<AuthProvider>().user?.id;

  String get _doctorName {
    final conversation = _conversation;
    if (conversation == null) return 'Médico';
    return _doctorNames[conversation.doctorId] ?? 'Médico';
  }

  Future<void> _initChat() async {
    final userId = _userId;
    if (userId == null) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Sessão expirada. Faça login novamente.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        _chatService.listMyConversations(userId),
        _chatService.getDoctorNamesByDoctorId(userId),
      ]);

      final conversations = results[0] as List<ChatConversation>;
      final doctorNames = results[1] as Map<String, String>;

      if (!mounted) return;

      if (conversations.isEmpty) {
        setState(() {
          _doctorNames = doctorNames;
          _conversation = null;
          _messages = [];
          _isLoading = false;
        });
        return;
      }

      final conversation = conversations.first;
      final messages = await _chatService.getMessages(conversation.id);

      if (!mounted) return;

      setState(() {
        _doctorNames = doctorNames;
        _conversation = conversation;
        _messages = messages;
        _isLoading = false;
      });

      _scrollToBottom();
      _startPolling();
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = error.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Não foi possível carregar o chat.';
      });
    }
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(_pollInterval, (_) => _refreshMessages());
  }

  Future<void> _refreshMessages() async {
    final conversation = _conversation;
    if (conversation == null) return;

    try {
      final messages = await _chatService.getMessages(conversation.id);
      if (!mounted) return;

      final wasAtBottom = _isAtBottom();
      final hadNew = messages.length != _messages.length;

      setState(() {
        _messages = messages;
      });

      if (hadNew && wasAtBottom) {
        _scrollToBottom();
      }
    } catch (_) {
      // silencioso: polling tenta de novo no próximo ciclo
    }
  }

  Future<void> _sendMessage() async {
    final conversation = _conversation;
    final text = _controller.text.trim();
    if (conversation == null || text.isEmpty || _isSending) return;

    setState(() => _isSending = true);

    try {
      final message = await _chatService.sendMessage(
        conversationId: conversation.id,
        content: text,
        senderId: _userId,
      );

      if (!mounted) return;
      setState(() {
        _messages = [..._messages, message];
        _controller.clear();
        _isSending = false;
      });
      _scrollToBottom();
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() => _isSending = false);
      _showError(error.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _isSending = false);
      _showError('Não foi possível enviar a mensagem.');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red.shade600),
    );
  }

  bool _isAtBottom() {
    if (!_scrollController.hasClients) return true;
    final position = _scrollController.position;
    return position.pixels >= position.maxScrollExtent - 80;
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) {
      return 'M';
    }
    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1))
        .toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final hasConversation = _conversation != null;
    final title = hasConversation ? _doctorName : 'Chat';

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7F8),
      appBar: AppBar(
        backgroundColor: _green,
        elevation: 0,
        titleSpacing: 12,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: Colors.white.withOpacity(0.2),
              child: Text(
                hasConversation ? _initials(title) : 'V',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 17,
                      color: Colors.white,
                    ),
                  ),
                  if (hasConversation)
                    const Text(
                      'Médico',
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _isLoading ? null : _initChat,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: _green),
      );
    }

    if (_errorMessage != null) {
      return _buildErrorState();
    }

    if (_conversation == null) {
      return _buildEmptyState();
    }

    return Column(
      children: [
        Expanded(child: _buildMessageList()),
        _buildComposer(),
      ],
    );
  }

  Widget _buildStateIcon(IconData icon, Color color, Color background) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: background, shape: BoxShape.circle),
      child: Icon(icon, size: 44, color: color),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildStateIcon(
                Icons.error_outline, Colors.red.shade400, Colors.red.shade50),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.red.shade700),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _initChat,
              style: ElevatedButton.styleFrom(
                backgroundColor: _green,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Tentar novamente',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildStateIcon(Icons.chat_bubble_outline, AppColors.primary,
                AppColors.primaryTint),
            const SizedBox(height: 16),
            const Text(
              'Nenhuma conversa ainda',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.foreground,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Quando seu médico iniciar uma conversa, ela aparecerá aqui.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.mutedForeground),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _initChat,
              icon: const Icon(Icons.refresh, color: _green),
              label: const Text(
                'Atualizar',
                style: TextStyle(color: _green),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _green),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageList() {
    if (_messages.isEmpty) {
      return ListView(
        controller: _scrollController,
        children: [
          const SizedBox(height: 100),
          Center(
            child: _buildStateIcon(Icons.forum_outlined, AppColors.primary,
                AppColors.primaryTint),
          ),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              'Nenhuma mensagem ainda.\nEnvie a primeira mensagem.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.mutedForeground),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final message = _messages[index];
        final showDay = index == 0 ||
            !_isSameDay(_messages[index - 1].timestamp, message.timestamp);
        return Column(
          children: [
            if (showDay) _buildDaySeparator(message.timestamp),
            _buildMessageBubble(message),
          ],
        );
      },
    );
  }

  bool _isSameDay(DateTime a, DateTime b) {
    final la = DateTimeUtils.toBrasilia(a);
    final lb = DateTimeUtils.toBrasilia(b);
    return la.year == lb.year && la.month == lb.month && la.day == lb.day;
  }

  Widget _buildDaySeparator(DateTime timestamp) {
    final local = DateTimeUtils.toBrasilia(timestamp);
    final now = DateTimeUtils.toBrasilia(DateTime.now().toUtc());
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(local.year, local.month, local.day);
    final diff = today.difference(day).inDays;

    String label;
    if (diff == 0) {
      label = 'Hoje';
    } else if (diff == 1) {
      label = 'Ontem';
    } else {
      label = '${local.day.toString().padLeft(2, '0')}/'
          '${local.month.toString().padLeft(2, '0')}/${local.year}';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.06),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.mutedForeground,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isMe = message.isFromPatient;
    final bubbleColor = isMe ? _green : Colors.white;
    final textColor = isMe ? Colors.white : AppColors.foreground;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 13),
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 16),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment:
              isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text(
                  message.senderLabel,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: _darkGreen,
                  ),
                ),
              ),
            Text(
              message.content,
              style: TextStyle(color: textColor, height: 1.3),
            ),
            const SizedBox(height: 3),
            Text(
              DateTimeUtils.formatHmBrasilia(message.timestamp),
              style: TextStyle(
                fontSize: 10,
                color: isMe ? Colors.white70 : Colors.black38,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildComposer() {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                decoration: InputDecoration(
                  hintText: 'Digite uma mensagem...',
                  filled: true,
                  fillColor: const Color(0xFFF1F3F4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: _green,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: _isSending ? null : _sendMessage,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: _isSending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send, color: Colors.white, size: 20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
