class ChatConversation {
  ChatConversation({
    required this.id,
    required this.patientId,
    required this.doctorId,
    required this.channel,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.unreadCount = 0,
  });

  final String id;
  final String patientId;
  final String doctorId;
  final String channel;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int unreadCount;

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    return ChatConversation(
      id: json['id'] as String,
      patientId: json['patientId'] as String,
      doctorId: json['doctorId'] as String,
      channel: json['channel'] as String? ?? 'WEB',
      status: json['status'] as String? ?? 'ACTIVE',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
    );
  }
}
