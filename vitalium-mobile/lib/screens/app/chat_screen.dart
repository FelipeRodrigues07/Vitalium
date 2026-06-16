import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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
  static const _green = Color(0xFF22A16C);
  static const _darkGreen = Color(0xFF016B3A);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _conversation == null ? 'Chat' : _doctorName,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
          ),
        ),
        backgroundColor: _green,
        centerTitle: true,
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

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red.shade400),
            const SizedBox(height: 12),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.red.shade700),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _initChat,
              style: ElevatedButton.styleFrom(backgroundColor: _darkGreen),
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
            Icon(Icons.chat_bubble_outline, size: 56, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            const Text(
              'Nenhuma conversa ainda',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Quando seu médico iniciar uma conversa, ela aparecerá aqui.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _initChat,
              icon: const Icon(Icons.refresh, color: _darkGreen),
              label: const Text(
                'Atualizar',
                style: TextStyle(color: _darkGreen),
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
        children: const [
          SizedBox(height: 120),
          Center(
            child: Text(
              'Nenhuma mensagem ainda.\nEnvie a primeira mensagem.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black54),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(12),
      itemCount: _messages.length,
      itemBuilder: (context, index) => _buildMessageBubble(_messages[index]),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isMe = message.isFromPatient;
    final bubbleColor = isMe ? _green : Colors.grey.shade200;
    final textColor = isMe ? Colors.white : Colors.black87;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.circular(12),
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
            Text(message.content, style: TextStyle(color: textColor)),
            const SizedBox(height: 2),
            Text(
              DateTimeUtils.formatHmBrasilia(message.timestamp),
              style: TextStyle(
                fontSize: 10,
                color: isMe ? Colors.white70 : Colors.black45,
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
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                decoration: const InputDecoration(
                  hintText: 'Digite uma mensagem...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                  ),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: _isSending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: _green,
                      ),
                    )
                  : const Icon(Icons.send, color: _green),
              onPressed: _isSending ? null : _sendMessage,
            ),
          ],
        ),
      ),
    );
  }
}
