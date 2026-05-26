class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;

  String get fullName => '$firstName $lastName'.trim();

  bool get isPatient => role.toUpperCase() == 'PATIENT';

  factory UserProfile.fromLoginJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
    );
  }

  factory UserProfile.fromProfileJson(Map<String, dynamic> json) {
    return UserProfile(
      id: (json['sub'] ?? json['id']) as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'role': role,
      };

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
    );
  }
}
