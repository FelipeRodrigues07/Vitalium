import '../core/config/api_config.dart';

class SymptomLog {
  SymptomLog({
    required this.id,
    required this.patientId,
    required this.description,
    required this.createdAt,
    this.imageUrl,
    this.imageFileName,
    this.imageMimeType,
  });

  final String id;
  final String patientId;
  final String description;
  final DateTime createdAt;
  final String? imageUrl;
  final String? imageFileName;
  final String? imageMimeType;

  String? get fullImageUrl {
    if (imageUrl == null || imageUrl!.isEmpty) {
      return null;
    }
    if (imageUrl!.startsWith('http')) {
      return imageUrl;
    }
    return '${ApiConfig.baseUrl}$imageUrl';
  }

  factory SymptomLog.fromJson(Map<String, dynamic> json) {
    return SymptomLog(
      id: json['id'] as String,
      patientId: json['patientId'] as String,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      imageUrl: json['imageUrl'] as String?,
      imageFileName: json['imageFileName'] as String?,
      imageMimeType: json['imageMimeType'] as String?,
    );
  }
}
