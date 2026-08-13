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

class _ChatScreenState extends State<ChatScreen>
    with AutomaticKeepAliveClientMixin {
  static const _pollInterval = Duration(seconds: 4);

  final _chatService = ChatService();
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();

  Timer? _pollTimer;

  bool _isLoading = true;
  bool _isSending = false;
  bool _isOpening = false;
  String? _errorMessage;

  List<ChatConversation> _conversations = [];
  List<LinkedDoctor> _linkedDoctors = [];
  ChatConversation? _activeConversation;
  List<ChatMessage> _messages = [];

  @override
  bool get wantKeepAlive => true;

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
    _focusNode.dispose();
    super.dispose();
  }

  String? get _userId => context.read<AuthProvider>().user?.id;

  String _doctorNameFor(String doctorId) {
    for (final doctor in _linkedDoctors) {
      if (doctor.doctorId == doctorId) return doctor.name;
    }
    return 'Médico';
  }

  String get _activeDoctorName {
    final conversation = _activeConversation;
    if (conversation == null) return 'Chat';
    return _doctorNameFor(conversation.doctorId);
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
        _chatService.getLinkedDoctors(userId),
      ]);

      if (!mounted) return;

      final conversations = results[0] as List<ChatConversation>;
      final doctors = results[1] as List<LinkedDoctor>;

      setState(() {
        _conversations = conversations;
        _linkedDoctors = doctors;
        _isLoading = false;
        // Se já estava numa conversa, mantém; senão limpa.
        if (_activeConversation != null) {
          final stillExists = conversations.any(
            (c) => c.id == _activeConversation!.id,
          );
          if (!stillExists) {
            _activeConversation = null;
            _messages = [];
            _pollTimer?.cancel();
          }
        }
      });

      if (_activeConversation != null) {
        await _loadThread(_activeConversation!);
      }
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

  Future<void> _loadThread(ChatConversation conversation) async {
    setState(() {
      _activeConversation = conversation;
      _isOpening = true;
      _errorMessage = null;
    });

    try {
      final messages = await _chatService.getMessages(conversation.id);
      if (!mounted) return;

      setState(() {
        _messages = messages;
        _isOpening = false;
      });
      _scrollToBottom(force: true);
      _startPolling();
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _isOpening = false;
        _errorMessage = error.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isOpening = false;
        _errorMessage = 'Não foi possível abrir a conversa.';
      });
    }
  }

  ChatConversation? _findConversationByDoctor(String doctorId) {
    for (final conversation in _conversations) {
      if (conversation.doctorId == doctorId) return conversation;
    }
    return null;
  }

  Future<void> _openOrCreateWithDoctor(LinkedDoctor doctor) async {
    final existing = _findConversationByDoctor(doctor.doctorId);

    if (existing != null) {
      await _loadThread(existing);
      return;
    }

    setState(() => _isOpening = true);

    try {
      final created = await _chatService.createConversation(
        patientId: doctor.patientId,
        doctorId: doctor.doctorId,
      );
      if (!mounted) return;

      setState(() {
        _conversations = [created, ..._conversations];
      });
      await _loadThread(created);
    } on ApiException catch (error) {
      if (error.statusCode == 409) {
        final userId = _userId;
        if (userId == null) return;
        final conversations = await _chatService.listMyConversations(userId);
        if (!mounted) return;
        setState(() => _conversations = conversations);
        final match = _findConversationByDoctor(doctor.doctorId);
        if (match != null) {
          await _loadThread(match);
          return;
        }
      }
      if (!mounted) return;
      setState(() => _isOpening = false);
      _showError(error.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _isOpening = false);
      _showError('Não foi possível iniciar a conversa.');
    }
  }

  void _closeThread() {
    _pollTimer?.cancel();
    setState(() {
      _activeConversation = null;
      _messages = [];
      _errorMessage = null;
    });
    _initChat();
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(_pollInterval, (_) => _refreshMessages());
  }

  Future<void> _refreshMessages() async {
    final conversation = _activeConversation;
    if (conversation == null || _isSending) return;

    try {
      final messages = await _chatService.getMessages(conversation.id);
      if (!mounted || _activeConversation?.id != conversation.id) return;

      final wasAtBottom = _isAtBottom();
      final hadNew = messages.length != _messages.length ||
          (messages.isNotEmpty &&
              _messages.isNotEmpty &&
              messages.last.id != _messages.last.id);

      setState(() {
        _messages = _mergeMessages(_messages, messages);
      });

      if (hadNew && wasAtBottom) {
        _scrollToBottom();
      }
    } catch (_) {
      // polling silencioso
    }
  }

  List<ChatMessage> _mergeMessages(
    List<ChatMessage> current,
    List<ChatMessage> incoming,
  ) {
    final byId = <String, ChatMessage>{};
    for (final message in [...current, ...incoming]) {
      if (message.id.startsWith('temp-')) continue;
      byId[message.id] = message;
    }
    final merged = byId.values.toList()
      ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
    return merged;
  }

  Future<void> _sendMessage() async {
    final conversation = _activeConversation;
    final text = _controller.text.trim();
    if (conversation == null || text.isEmpty || _isSending) return;

    final optimistic = ChatMessage(
      id: 'temp-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversation.id,
      content: text,
      origin: 'PATIENT',
      channel: 'WEB',
      status: 'SENT',
      timestamp: DateTime.now().toUtc(),
    );

    setState(() {
      _isSending = true;
      _messages = [..._messages, optimistic];
      _controller.clear();
    });
    _scrollToBottom(force: true);

    try {
      final message = await _chatService.sendMessage(
        conversationId: conversation.id,
        content: text,
      );

      if (!mounted) return;
      setState(() {
        _messages = [
          for (final item in _messages)
            if (item.id != optimistic.id) item,
          message,
        ];
        _isSending = false;
      });
      _scrollToBottom(force: true);
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _messages = _messages.where((m) => m.id != optimistic.id).toList();
        _isSending = false;
        _controller.text = text;
      });
      _showError(error.message);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messages = _messages.where((m) => m.id != optimistic.id).toList();
        _isSending = false;
        _controller.text = text;
      });
      _showError('Não foi possível enviar a mensagem.');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.destructive,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  bool _isAtBottom() {
    if (!_scrollController.hasClients) return true;
    final position = _scrollController.position;
    return position.pixels >= position.maxScrollExtent - 80;
  }

  void _scrollToBottom({bool force = false}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      if (!force && !_isAtBottom()) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
      );
    });
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return 'M';
    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1))
        .toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final inThread = _activeConversation != null;

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6F5),
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        leading: inThread
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
                onPressed: _closeThread,
              )
            : null,
        titleSpacing: inThread ? 0 : 16,
        title: inThread ? _buildThreadTitle() : _buildListTitle(),
        actions: [
          IconButton(
            tooltip: 'Atualizar',
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: _isLoading || _isOpening
                ? null
                : () {
                    if (inThread && _activeConversation != null) {
                      _loadThread(_activeConversation!);
                    } else {
                      _initChat();
                    }
                  },
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildListTitle() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Conversas',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: Colors.white,
          ),
        ),
        Text(
          'Fale com seu médico',
          style: TextStyle(fontSize: 12, color: Colors.white70),
        ),
      ],
    );
  }

  Widget _buildThreadTitle() {
    final name = _activeDoctorName;
    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: Colors.white.withOpacity(0.22),
          child: Text(
            _initials(name),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              const Text(
                'Médico responsável',
                style: TextStyle(fontSize: 12, color: Colors.white70),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_errorMessage != null && _activeConversation == null) {
      return _buildErrorState();
    }

    if (_activeConversation != null) {
      if (_isOpening) {
        return const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        );
      }
      return Column(
        children: [
          Expanded(child: _buildMessageList()),
          _buildComposer(),
        ],
      );
    }

    return _buildConversationList();
  }

  Widget _buildConversationList() {
    final doctorsWithoutChat = _linkedDoctors.where((doctor) {
      return !_conversations.any((c) => c.doctorId == doctor.doctorId);
    }).toList();

    if (_conversations.isEmpty && _linkedDoctors.isEmpty) {
      return _buildEmptyState(
        icon: Icons.chat_bubble_outline_rounded,
        title: 'Nenhuma conversa',
        subtitle:
            'Quando um médico for vinculado a você, poderá iniciar o chat aqui.',
        actionLabel: 'Atualizar',
        onAction: _initChat,
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _initChat,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          if (_conversations.isNotEmpty) ...[
            const Text(
              'Suas conversas',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.mutedForeground,
              ),
            ),
            const SizedBox(height: 10),
            ..._conversations.map(_buildConversationCard),
            const SizedBox(height: 20),
          ],
          if (doctorsWithoutChat.isNotEmpty) ...[
            const Text(
              'Iniciar conversa',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.mutedForeground,
              ),
            ),
            const SizedBox(height: 10),
            ...doctorsWithoutChat.map(_buildDoctorStartCard),
          ],
          if (_conversations.isEmpty && doctorsWithoutChat.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Toque no médico para abrir o chat.',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildConversationCard(ChatConversation conversation) {
    final name = _doctorNameFor(conversation.doctorId);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: _isOpening ? null : () => _loadThread(conversation),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primaryTint,
                  child: Text(
                    _initials(name),
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.foreground,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Toque para continuar a conversa',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.mutedForeground,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDoctorStartCard(LinkedDoctor doctor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: _isOpening ? null : () => _openOrCreateWithDoctor(doctor),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primary.withOpacity(0.12),
                  child: const Icon(
                    Icons.person_add_alt_1_rounded,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        doctor.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.foreground,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Iniciar conversa',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (_isOpening)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                else
                  const Icon(
                    Icons.chat_outlined,
                    color: AppColors.primary,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required String actionLabel,
    required VoidCallback onAction,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: const BoxDecoration(
                color: AppColors.primaryTint,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 42, color: AppColors.primary),
            ),
            const SizedBox(height: 18),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.foreground,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: onAction,
              icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
              label: Text(
                actionLabel,
                style: const TextStyle(color: AppColors.primary),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline_rounded,
                size: 42,
                color: Colors.red.shade400,
              ),
            ),
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
                backgroundColor: AppColors.primary,
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

  Widget _buildMessageList() {
    if (_messages.isEmpty) {
      return ListView(
        controller: _scrollController,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        children: [
          Center(
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.forum_outlined,
                size: 36,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Conversa iniciada',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Envie a primeira mensagem para o seu médico.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.mutedForeground),
          ),
        ],
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
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

    final String label;
    if (diff == 0) {
      label = 'Hoje';
    } else if (diff == 1) {
      label = 'Ontem';
    } else {
      label =
          '${local.day.toString().padLeft(2, '0')}/${local.month.toString().padLeft(2, '0')}/${local.year}';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
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
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isMe = message.isFromPatient;
    final isTemp = message.id.startsWith('temp-');

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        margin: const EdgeInsets.symmetric(vertical: 3),
        padding: const EdgeInsets.fromLTRB(12, 9, 12, 7),
        decoration: BoxDecoration(
          gradient: isMe
              ? const LinearGradient(
                  colors: [AppColors.primary, AppColors.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isMe ? null : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMe ? 18 : 5),
            bottomRight: Radius.circular(isMe ? 5 : 18),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
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
                padding: const EdgeInsets.only(bottom: 3),
                child: Text(
                  message.senderLabel,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryStrong,
                  ),
                ),
              ),
            Text(
              message.content,
              style: TextStyle(
                color: isMe ? Colors.white : AppColors.foreground,
                height: 1.35,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateTimeUtils.formatHmBrasilia(message.timestamp),
                  style: TextStyle(
                    fontSize: 10,
                    color: isMe ? Colors.white70 : Colors.black38,
                  ),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  Icon(
                    isTemp ? Icons.schedule_rounded : Icons.done_all_rounded,
                    size: 14,
                    color: Colors.white70,
                  ),
                ],
              ],
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
        padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                minLines: 1,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                decoration: InputDecoration(
                  hintText: 'Escreva sua mensagem...',
                  hintStyle: TextStyle(color: Colors.grey.shade500),
                  filled: true,
                  fillColor: const Color(0xFFF1F4F3),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: AppColors.primary,
              shape: const CircleBorder(),
              elevation: 1,
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: _isSending ? null : _sendMessage,
                child: SizedBox(
                  width: 48,
                  height: 48,
                  child: Center(
                    child: _isSending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(
                            Icons.send_rounded,
                            color: Colors.white,
                            size: 22,
                          ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
