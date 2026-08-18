import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { AppModule } from '../../src/modules/app.module';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { Role } from '../../src/shared/enums/role.enum';

describe('Prescriptions API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;
  let patientId: string;
  let doctorId: string;
  let unitId: string;

  const adminEmail = 'test-e2e-prescription-admin@example.com';
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
    await prisma.prescription.deleteMany({
      where: { medication: { contains: 'test-e2e-prescription' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-prescription' } } },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-prescription' } },
    });
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-prescription' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-prescription' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.prescription.deleteMany({
      where: { medication: { contains: 'test-e2e-prescription' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-prescription' } } },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-prescription' } },
    });
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-prescription' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-prescription' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Prescription',
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
        email: 'test-e2e-prescription-patient@example.com',
        password: 'hashed',
        firstName: 'Paciente',
        lastName: 'Receita',
        isActive: true,
        role: Role.PATIENT,
      },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        birthDate: new Date('1985-05-10'),
        cpf: '33344455566',
        gender: 'MALE',
      },
    });
    patientId = patient.id;

    const doctorUser = await prisma.user.create({
      data: {
        email: 'test-e2e-prescription-doctor@example.com',
        password: 'hashed',
        firstName: 'Dr. Receita',
        lastName: 'Medico',
        isActive: true,
        role: Role.DOCTOR,
      },
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        crm: 'test-e2e-prescription-CRM001',
        crmState: true,
      },
    });
    doctorId = doctor.id;

    const unit = await prisma.unit.create({
      data: {
        name: 'test-e2e-prescription-Unit',
        type: 'HOSPITAL',
        address: 'Av Receita, 10',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000001',
        cnpj: `${Date.now() + 1}`.padEnd(14, '0').slice(0, 14),
      },
    });
    unitId = unit.id;

    await prisma.doctorUnit.create({
      data: {
        doctorId: doctor.id,
        unitId: unit.id,
        consultationPrice: 150,
        isPrimary: true,
      },
    });
    await prisma.patientUnit.create({
      data: {
        patientId: patient.id,
        unitId: unit.id,
        isPrimary: true,
      },
    });
  });

  // ─── POST /prescriptions ───────────────────────────────────────────────────

  describe('POST /prescriptions', () => {
    it('should create a prescription', async () => {
      const response = await request(app.getHttpServer())
        .post('/prescriptions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          patientId,
          doctorId,
          unitId,
          medication: 'test-e2e-prescription Paracetamol',
          dosage: '500mg',
          frequency: '8h',
          duration: '7 dias',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.medication).toBe(
        'test-e2e-prescription Paracetamol',
      );
      expect(response.body.patientId).toBe(patientId);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/prescriptions')
        .send({
          patientId,
          doctorId,
          unitId,
          medication: 'x',
          dosage: 'y',
          frequency: 'z',
          duration: 'w',
        })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/prescriptions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ patientId })
        .expect(400);
    });
  });

  // ─── GET /prescriptions/patient/:patientId ─────────────────────────────────

  describe('GET /prescriptions/patient/:patientId', () => {
    it('should return prescriptions for a patient', async () => {
      await prisma.prescription.create({
        data: {
          patientId,
          doctorId,
          unitId,
          medication: 'test-e2e-prescription Ibuprofeno',
          dosage: '400mg',
          frequency: '6h',
          duration: '5 dias',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/prescriptions/patient/${patientId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // ─── GET /prescriptions/doctor/:doctorId ──────────────────────────────────

  describe('GET /prescriptions/doctor/:doctorId', () => {
    it('should return prescriptions for a doctor', async () => {
      const response = await request(app.getHttpServer())
        .get(`/prescriptions/doctor/${doctorId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ─── GET /prescriptions/:id ────────────────────────────────────────────────

  describe('GET /prescriptions/:id', () => {
    it('should return prescription by id', async () => {
      const prescription = await prisma.prescription.create({
        data: {
          patientId,
          doctorId,
          unitId,
          medication: 'test-e2e-prescription Amoxicilina',
          dosage: '250mg',
          frequency: '12h',
          duration: '10 dias',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/prescriptions/${prescription.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(prescription.id);
    });

    it('should return 404 for non-existent prescription', async () => {
      await request(app.getHttpServer())
        .get('/prescriptions/nonexistent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /prescriptions/:id ─────────────────────────────────────────────

  describe('PATCH /prescriptions/:id', () => {
    it('should update prescription dosage', async () => {
      const prescription = await prisma.prescription.create({
        data: {
          patientId,
          doctorId,
          unitId,
          medication: 'test-e2e-prescription Dipirona',
          dosage: '500mg',
          frequency: '6h',
          duration: '3 dias',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/prescriptions/${prescription.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ dosage: '1000mg' })
        .expect(200);

      expect(response.body.dosage).toBe('1000mg');
    });
  });

  // ─── DELETE /prescriptions/:id ────────────────────────────────────────────

  describe('DELETE /prescriptions/:id', () => {
    it('should delete a prescription', async () => {
      const prescription = await prisma.prescription.create({
        data: {
          patientId,
          doctorId,
          unitId,
          medication: 'test-e2e-prescription Delete',
          dosage: '100mg',
          frequency: '24h',
          duration: '1 dia',
        },
      });

      await request(app.getHttpServer())
        .delete(`/prescriptions/${prescription.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
    });
  });
});
