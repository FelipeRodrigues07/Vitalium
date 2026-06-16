import 'dart:convert';

import '../models/chat_conversation.dart';
import '../models/chat_message.dart';
import 'api_client.dart';
import '../storage/auth_storage.dart';

class ChatService {
  ChatService({
    AuthStorage? storage,
    ApiClient? apiClient,
  }) : _api = apiClient ?? ApiClient(storage ?? AuthStorage());

  final ApiClient _api;

  /// Lista as conversas do paciente logado.
  /// O backend resolve o paciente a partir do userId informado.
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

  /// Busca as mensagens de uma conversa (ordem cronológica, mais antigas primeiro).
  Future<List<ChatMessage>> getMessages(
    String conversationId, {
    int page = 1,
    int limit = 100,
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
    final messages = data['messages'] as List<dynamic>? ?? [];
    return messages
        .map((item) => ChatMessage.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Envia uma mensagem como paciente.
  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
    String? senderId,
  }) async {
    final response = await _api.post(
      '/chat/conversations/$conversationId/messages',
      body: {
        'content': content.trim(),
        'origin': 'PATIENT',
        'channel': 'WEB',
        if (senderId != null) 'senderId': senderId,
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

  /// Mapa doctorId -> nome do médico, para exibir nas conversas do paciente.
  Future<Map<String, String>> getDoctorNamesByDoctorId(String userId) async {
    final response =
        await _api.get('/patient-doctors/patient/by-user/$userId');

    if (response.statusCode != 200) {
      // Sem nomes não é fatal: o chat ainda funciona com rótulo genérico.
      return {};
    }

    final data = jsonDecode(response.body) as List<dynamic>;
    final result = <String, String>{};

    for (final item in data) {
      if (item is! Map<String, dynamic>) continue;
      final doctorId = item['doctorId'] as String?;
      final doctor = item['doctor'] as Map<String, dynamic>?;
      if (doctorId == null) continue;

      final name = _personName(doctor);
      if (name != null) {
        result[doctorId] = name;
      }
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
