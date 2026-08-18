import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { AppModule } from '../../src/modules/app.module';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { AppointmentStatus } from '../../src/shared/enums/appointment-status.enum';
import { AppointmentType } from '../../src/shared/enums/appointment-type.enum';
import { Role } from '../../src/shared/enums/role.enum';

describe('Appointments API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;
  let patientId: string;
  let doctorId: string;
  let unitId: string;

  const adminEmail = 'test-e2e-appointment-admin@example.com';
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
    await prisma.appointment.deleteMany({
      where: { title: { contains: 'test-e2e-appointment' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-appointment' } } },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-appointment' } },
    });
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-appointment' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-appointment' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.appointment.deleteMany({
      where: { title: { contains: 'test-e2e-appointment' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-appointment' } } },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-appointment' } },
    });
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-appointment' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-appointment' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Appointment',
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
        email: 'test-e2e-appointment-patient@example.com',
        password: 'hashed',
        firstName: 'Paciente',
        lastName: 'Teste',
        isActive: true,
        role: Role.PATIENT,
      },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        birthDate: new Date('1990-01-01'),
        cpf: '22233344455',
        gender: 'MALE',
      },
    });
    patientId = patient.id;

    const doctorUser = await prisma.user.create({
      data: {
        email: 'test-e2e-appointment-doctor@example.com',
        password: 'hashed',
        firstName: 'Dr. Medico',
        lastName: 'Teste',
        isActive: true,
        role: Role.DOCTOR,
      },
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        crm: 'test-e2e-appointment-CRM001',
        crmState: true,
      },
    });
    doctorId = doctor.id;

    const unit = await prisma.unit.create({
      data: {
        name: 'test-e2e-appointment-Unit',
        type: 'HOSPITAL',
        address: 'Rua Teste, 1',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        cnpj: `${Date.now()}`.padEnd(14, '0').slice(0, 14),
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

  // ─── POST /appointments ────────────────────────────────────────────────────

  describe('POST /appointments', () => {
    it('should create an appointment', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          patientId,
          doctorId,
          unitId,
          title: 'test-e2e-appointment Consulta',
          scheduledAt: '2027-06-01T09:00:00.000Z',
          type: AppointmentType.CONSULTATION,
          status: AppointmentStatus.SCHEDULED,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.doctorId).toBe(doctorId);
      expect(response.body.status).toBe(AppointmentStatus.SCHEDULED);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .send({
          patientId,
          doctorId,
          unitId,
          title: 'x',
          scheduledAt: '2027-01-01T00:00:00.000Z',
        })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ patientId })
        .expect(400);
    });
  });

  // ─── GET /appointments/patient/:patientId ──────────────────────────────────

  describe('GET /appointments/patient/:patientId', () => {
    it('should return appointments for a patient', async () => {
      await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          unitId,
          title: 'test-e2e-appointment Consulta 2',
          scheduledAt: new Date('2027-07-01T09:00:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
          type: AppointmentType.CONSULTATION,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/appointments/patient/${patientId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // ─── GET /appointments/doctor/:doctorId ────────────────────────────────────

  describe('GET /appointments/doctor/:doctorId', () => {
    it('should return appointments for a doctor', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appointments/doctor/${doctorId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ─── GET /appointments/:id ─────────────────────────────────────────────────

  describe('GET /appointments/:id', () => {
    it('should return appointment by id', async () => {
      const appt = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          unitId,
          title: 'test-e2e-appointment Single',
          scheduledAt: new Date('2027-08-01T10:00:00.000Z'),
          status: AppointmentStatus.CONFIRMED,
          type: AppointmentType.CONSULTATION,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/appointments/${appt.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(appt.id);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app.getHttpServer())
        .get('/appointments/nonexistent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /appointments/:id ───────────────────────────────────────────────

  describe('PATCH /appointments/:id', () => {
    it('should update appointment status', async () => {
      const appt = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          unitId,
          title: 'test-e2e-appointment Update',
          scheduledAt: new Date('2027-09-01T10:00:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
          type: AppointmentType.CONSULTATION,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appt.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: AppointmentStatus.CONFIRMED })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CONFIRMED);
    });
  });

  // ─── DELETE /appointments/:id ──────────────────────────────────────────────

  describe('DELETE /appointments/:id', () => {
    it('should delete an appointment', async () => {
      const appt = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          unitId,
          title: 'test-e2e-appointment Delete',
          scheduledAt: new Date('2027-10-01T10:00:00.000Z'),
          status: AppointmentStatus.SCHEDULED,
          type: AppointmentType.CONSULTATION,
        },
      });

      await request(app.getHttpServer())
        .delete(`/appointments/${appt.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
    });
  });
});
