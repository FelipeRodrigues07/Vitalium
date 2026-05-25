import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Vitalium Backend API')
      .setDescription('API para sistema de gestão médica Vitalium')
      .setVersion('0.0.1')
      .addTag('auth', 'Autenticação e autorização')
      .addTag('users', 'Operações relacionadas aos usuários')
      .addTag('admins', 'Gerenciamento de administradores')
      .addTag('doctors', 'Operações relacionadas aos médicos')
      .addTag('doctor-units', 'Vínculos entre médicos e unidades')
      .addTag('units', 'Operações relacionadas às unidades')
      .addTag('health', 'Status da aplicação')
      .addTag('patients', 'Operações relacionadas aos pacientes')
      .addTag('chat', 'Mensagens e conversas entre médico e paciente')
      .addTag('medical-records', 'Prontuários médicos')
      .addTag('appointments', 'Agendamento de consultas')
      .addTag('prescriptions', 'Prescrições médicas')
      .addTag('wards', 'Alas e quartos das unidades')
      .addTag('ward-admissions', 'Internações hospitalares')
      .addTag('caregivers', 'Cuidadores de pacientes')
      .addTag('patient-doctors', 'Vínculos paciente-médico')
      .addTag('patient-caregivers', 'Vínculos paciente-cuidador')
      .addTag('patient-units', 'Vínculos paciente-unidade')
      .addTag('nurses', 'Operações relacionadas aos enfermeiros(as)')
      .addTag('nurse-units', 'Vínculos enfermeiro(a)-unidade')
      .addTag('specializations', 'Especializações médicas')
      .addTag('doctor-specializations', 'Vínculos médico-especialização')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addServer('http://localhost:3000', 'Servidor de Desenvolvimento')
      .addServer('https://api.vitalium.com', 'Servidor de Produção')
      .setContact('Equipe Vitalium', 'https://vitalium.com', 'dev@vitalium.com')
      .setLicense('Private / Proprietary', '')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Vitalium API Docs',
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #2d5aa0; }
        .swagger-ui .scheme-container { background: #f8f9fa; }
      `,
    });
  }
}
