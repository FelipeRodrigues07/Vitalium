import 'dart:convert';

import '../models/chat_conversation.dart';
import '../models/chat_message.dart';
import '../storage/auth_storage.dart';
import 'api_client.dart';

class LinkedDoctor {
  LinkedDoctor({
    required this.patientId,
    required this.doctorId,
    required this.name,
  });

  final String patientId;
  final String doctorId;
  final String name;
}

class ChatService {
  ChatService({
    AuthStorage? storage,
    ApiClient? apiClient,
  }) : _api = apiClient ?? ApiClient(storage ?? AuthStorage());

  final ApiClient _api;

  Future<List<ChatConversation>> listMyConversations(String userId) async {
    final response = await _api.get('/chat/conversations/patient/$userId');

    if (response.statusCode != 200) {
      throw ApiException(
        ApiClient.parseErrorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final data = jsonDecode(response.body) as List<dynamic>;
    return data
        .map((item) => ChatConversation.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Carrega as mensagens mais recentes (última página em ordem cronológica).
  Future<List<ChatMessage>> getMessages(
    String conversationId, {
    int limit = 80,
  }) async {
    final first = await _fetchMessagesPage(
      conversationId,
      page: 1,
      limit: limit,
    );

    final total = first.total;
    if (total <= limit) {
      return first.messages;
    }

    final lastPage = (total / limit).ceil();
    final last = await _fetchMessagesPage(
      conversationId,
      page: lastPage,
      limit: limit,
    );
    return last.messages;
  }

  Future<({List<ChatMessage> messages, int total})> _fetchMessagesPage(
    String conversationId, {
    required int page,
    required int limit,
  }) async {
    final response = await _api.get(
      '/chat/conversations/$conversationId/messages?page=$page&limit=$limit',
    );

    if (response.statusCode != 200) {
      throw ApiException(
        ApiClient.parseErrorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final messages = (data['messages'] as List<dynamic>? ?? [])
        .map((item) => ChatMessage.fromJson(item as Map<String, dynamic>))
        .toList();
    final total = (data['total'] as num?)?.toInt() ?? messages.length;
    return (messages: messages, total: total);
  }

  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final response = await _api.post(
      '/chat/conversations/$conversationId/messages',
      body: {
        'content': content.trim(),
        'origin': 'PATIENT',
        'channel': 'WEB',
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(
        ApiClient.parseErrorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return ChatMessage.fromJson(data);
  }

  Future<ChatConversation> createConversation({
    required String patientId,
    required String doctorId,
  }) async {
    final response = await _api.post(
      '/chat/conversations',
      body: {
        'patientId': patientId,
        'doctorId': doctorId,
        'channel': 'WEB',
      },
    );

    if (response.statusCode == 409) {
      // Já existe: recarrega lista e devolve a conversa correspondente.
      throw ApiException(
        'Conversa já existe',
        statusCode: 409,
      );
    }

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(
        ApiClient.parseErrorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return ChatConversation.fromJson(data);
  }

  Future<List<LinkedDoctor>> getLinkedDoctors(String userId) async {
    final response =
        await _api.get('/patient-doctors/patient/by-user/$userId');

    if (response.statusCode != 200) {
      return [];
    }

    final data = jsonDecode(response.body) as List<dynamic>;
    final result = <LinkedDoctor>[];

    for (final item in data) {
      if (item is! Map<String, dynamic>) continue;
      final patientId = item['patientId'] as String?;
      final doctorId = item['doctorId'] as String?;
      if (patientId == null || doctorId == null) continue;

      final doctor = item['doctor'] as Map<String, dynamic>?;
      final name = _personName(doctor) ?? 'Médico';
      result.add(
        LinkedDoctor(
          patientId: patientId,
          doctorId: doctorId,
          name: name,
        ),
      );
    }

    return result;
  }

  String? _personName(Map<String, dynamic>? person) {
    if (person == null) return null;

    final source = person['user'] is Map<String, dynamic>
        ? person['user'] as Map<String, dynamic>
        : person;

    final first = (source['firstName'] as String?)?.trim() ?? '';
    final last = (source['lastName'] as String?)?.trim() ?? '';
    final full = '$first $last'.trim();

    return full.isEmpty ? null : full;
  }
}
