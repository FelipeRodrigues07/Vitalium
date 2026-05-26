import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app.dart';

void main() {
  testWidgets('shows login screen when not authenticated', (tester) async {
    await tester.pumpWidget(const VitaliumApp());
    await tester.pumpAndSettle();

    expect(find.text('Acesso do paciente'), findsOneWidget);
    expect(find.text('Entrar'), findsOneWidget);
  });
}
