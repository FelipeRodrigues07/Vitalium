import '../core/utils/date_time_utils.dart';

class ChatMessage {
  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.content,
    required this.origin,
    required this.channel,
    required this.status,
    required this.timestamp,
    this.senderId,
  });

  final String id;
  final String conversationId;
  final String content;
  final String origin; // PATIENT, DOCTOR, AI, SYSTEM
  final String channel;
  final String status;
  final DateTime timestamp;
  final String? senderId;

  bool get isFromPatient => origin.toUpperCase() == 'PATIENT';

  String get senderLabel {
    switch (origin.toUpperCase()) {
      case 'DOCTOR':
        return 'Médico';
      case 'AI':
        return 'Assistente';
      case 'SYSTEM':
        return 'Sistema';
      case 'PATIENT':
      default:
        return 'Você';
    }
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['conversationId'] as String,
      content: json['content'] as String? ?? '',
      origin: json['origin'] as String? ?? 'SYSTEM',
      channel: json['channel'] as String? ?? 'WEB',
      status: json['status'] as String? ?? 'SENT',
      timestamp: DateTimeUtils.parseApiUtc(json['timestamp'] as String),
      senderId: json['senderId'] as String?,
    );
  }
}
