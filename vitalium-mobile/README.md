# Vitalium Mobile (Paciente)

App Flutter para pacientes — login integrado com a API Vitalium.

## Pré-requisitos

- Flutter SDK
- Backend rodando (ex.: `http://localhost:3000`)

## Instalação

```bash
cd vitalium-mobile
flutter pub get
```

## Rodar

**Emulador Android** (API em `localhost:3000` no host):

```bash
flutter run
```

**Dispositivo físico** (substitua pelo IP da sua máquina na rede):

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3000
```

## Conta de teste (seed)

| Email | Senha |
|-------|--------|
| `paciente1@vitalium.com` | `paciente123456` |

Apenas usuários com perfil **PATIENT** podem entrar no app.

## Autenticação

- `POST /auth/login` — login
- `GET /auth/profile` — restaurar sessão
- `POST /auth/refresh` — renovar access token
- `POST /auth/logout` — sair

Tokens ficam em `lib/storage/auth_storage.dart` (`shared_preferences`, sessão persistente).
