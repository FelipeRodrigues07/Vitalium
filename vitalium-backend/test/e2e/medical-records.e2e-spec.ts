import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { RecordType } from '../../src/shared/enums/record-type.enum';

describe('Medical Records API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;
  let patientId: string;
  let doctorId: string;

  const adminEmail = 'test-e2e-medical-admin@example.com';
  const password = 'TestPassword123!';

  async function loginAndGetToken(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    return res.body.accessToken;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    prisma = app.get<PrismaProvider>(PrismaProvider);
    await app.init();
  }, 30000);

  afterAll(async () => {
    await prisma.medicalAttachment.deleteMany({
      where: { medicalRecord: { title: { contains: 'test-e2e-medical' } } },
    });
    await prisma.medicalRecord.deleteMany({
      where: { title: { contains: 'test-e2e-medical' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-medical' } } },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-medical' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-medical' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.medicalAttachment.deleteMany({
      where: { medicalRecord: { title: { contains: 'test-e2e-medical' } } },
    });
    await prisma.medicalRecord.deleteMany({
      where: { title: { contains: 'test-e2e-medical' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-medical' } } },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-medical' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-medical' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Medical',
        isActive: true,
        role: Role.ADMIN,
      },
    });
    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },
    });
    adminAccessToken = await loginAndGetToken(adminEmail);

    const patientUser = await prisma.user.create({
      data: {
        email: 'test-e2e-medical-patient@example.com',
        password: 'hashed',
        firstName: 'Paciente',
        lastName: 'Prontuario',
        isActive: true,
        role: Role.PATIENT,
      },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        birthDate: new Date('1990-06-15'),
        cpf: '44455566677',
        gender: 'MALE',
      },
    });
    patientId = patient.id;

    const doctorUser = await prisma.user.create({
      data: {
        email: 'test-e2e-medical-doctor@example.com',
        password: 'hashed',
        firstName: 'Dr. Prontuario',
        lastName: 'Medico',
        isActive: true,
        role: Role.DOCTOR,
      },
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        crm: 'test-e2e-medical-CRM001',
        crmState: true,
      },
    });
    doctorId = doctor.id;
  });

  // ─── POST /medical-records ─────────────────────────────────────────────────

  describe('POST /medical-records', () => {
    it('should create a medical record', async () => {
      const response = await request(app.getHttpServer())
        .post('/medical-records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          patientId,
          doctorId,
          title: 'test-e2e-medical Consulta Geral',
          description: 'Consulta de rotina',
          recordType: RecordType.CONSULTATION,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.doctorId).toBe(doctorId);
      expect(response.body.recordType).toBe(RecordType.CONSULTATION);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/medical-records')
        .send({
          patientId,
          doctorId,
          title: 'x',
          description: 'y',
          recordType: RecordType.CONSULTATION,
        })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/medical-records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ patientId })
        .expect(400);
    });
  });

  // ─── GET /medical-records/patient/:patientId ───────────────────────────────

  describe('GET /medical-records/patient/:patientId', () => {
    it('should return medical records for a patient', async () => {
      await prisma.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          title: 'test-e2e-medical Exame',
          description: 'Hemograma',
          recordType: RecordType.EXAMINATION,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/medical-records/patient/${patientId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // ─── GET /medical-records/doctor/:doctorId ─────────────────────────────────

  describe('GET /medical-records/doctor/:doctorId', () => {
    it('should return medical records for a doctor', async () => {
      const response = await request(app.getHttpServer())
        .get(`/medical-records/doctor/${doctorId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ─── GET /medical-records/:id ──────────────────────────────────────────────

  describe('GET /medical-records/:id', () => {
    it('should return medical record by id', async () => {
      const record = await prisma.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          title: 'test-e2e-medical Single',
          description: 'Avaliação',
          recordType: RecordType.ROUTINE_CHECKUP,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/medical-records/${record.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(record.id);
    });

    it('should return 404 for non-existent record', async () => {
      await request(app.getHttpServer())
        .get('/medical-records/nonexistent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /medical-records/:id ────────────────────────────────────────────

  describe('PATCH /medical-records/:id', () => {
    it('should update medical record', async () => {
      const record = await prisma.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          title: 'test-e2e-medical Update',
          description: 'Antes',
          recordType: RecordType.FOLLOW_UP,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/medical-records/${record.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ description: 'Depois' })
        .expect(200);

      expect(response.body.description).toBe('Depois');
    });
  });

  // ─── DELETE /medical-records/:id ──────────────────────────────────────────

  describe('DELETE /medical-records/:id', () => {
    it('should delete a medical record', async () => {
      const record = await prisma.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          title: 'test-e2e-medical Delete',
          description: 'Para deletar',
          recordType: RecordType.OTHER,
        },
      });

      await request(app.getHttpServer())
        .delete(`/medical-records/${record.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
    });
  });

  // ─── Medical Attachments ───────────────────────────────────────────────────

  describe('Medical Attachments', () => {
    let recordId: string;

    beforeEach(async () => {
      const record = await prisma.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          title: 'test-e2e-medical Attachments',
          description: 'Para anexos',
          recordType: RecordType.EXAMINATION,
        },
      });
      recordId = record.id;
    });

    describe('POST /medical-records/:recordId/attachments', () => {
      it('should create an attachment', async () => {
        const response = await request(app.getHttpServer())
          .post(`/medical-records/${recordId}/attachments`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({
            fileName: 'exame.pdf',
            fileUrl: 'https://storage.example.com/exame.pdf',
            fileType: 'application/pdf',
            fileSize: 12345,
          })
          .expect(201);

        expect(response.body.id).toBeDefined();
        expect(response.body.fileName).toBe('exame.pdf');
      });

      it('should return 400 for missing required fields', async () => {
        await request(app.getHttpServer())
          .post(`/medical-records/${recordId}/attachments`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({ fileName: 'x' })
          .expect(400);
      });
    });

    describe('GET /medical-records/:recordId/attachments', () => {
      it('should return all attachments for a record', async () => {
        await prisma.medicalAttachment.create({
          data: {
            medicalRecordId: recordId,
            fileName: 'resultado.pdf',
            fileUrl: 'https://storage.example.com/resultado.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/medical-records/${recordId}/attachments`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    describe('DELETE /medical-records/:recordId/attachments/:id', () => {
      it('should delete an attachment', async () => {
        const attachment = await prisma.medicalAttachment.create({
          data: {
            medicalRecordId: recordId,
            fileName: 'deletar.pdf',
            fileUrl: 'https://storage.example.com/deletar.pdf',
            fileType: 'application/pdf',
            fileSize: 2048,
          },
        });

        await request(app.getHttpServer())
          .delete(`/medical-records/${recordId}/attachments/${attachment.id}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(204);
      });
    });
  });
});
