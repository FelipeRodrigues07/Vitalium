import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';

describe('Doctor-Specializations API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let createdDoctorId: string;
  let createdSpecializationId: string;
  let createdDoctorSpecializationId: string;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-doctor-spec-admin@example.com';
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
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    prisma = app.get<PrismaProvider>(PrismaProvider);

    await app.init();
  }, 30000);

  afterAll(async () => {
    await prisma.doctorSpecialization.deleteMany({
      where: {
        doctor: {
          crm: {
            contains: 'test-e2e-doctor-spec',
          },
        },
      },
    });

    await prisma.doctor.deleteMany({
      where: {
        crm: {
          contains: 'test-e2e-doctor-spec',
        },
      },
    });

    await prisma.specialization.deleteMany({
      where: {
        name: {
          contains: 'test-e2e-doctor-spec',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-e2e-doctor-spec',
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.doctorSpecialization.deleteMany({
      where: {
        doctor: {
          crm: { contains: 'test-e2e-doctor-spec' },
        },
      },
    });
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-doctor-spec' } },
    });
    await prisma.specialization.deleteMany({
      where: { name: { contains: 'test-e2e-doctor-spec' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-doctor-spec' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Tester',
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

    // Create test doctor
    const doctorUser = await prisma.user.create({
      data: {
        email: 'test-e2e-doctor-spec-doctor@example.com',
        password: hashedPassword,
        firstName: 'Dr. Carlos',
        lastName: 'Santos',
        isActive: true,
        role: Role.DOCTOR,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        crm: 'test-e2e-doctor-spec-CRM123456',
        crmState: true,
        isActive: true,
      },
    });
    createdDoctorId = doctor.id;

    // Create test specialization
    const specialization = await prisma.specialization.create({
      data: {
        name: 'test-e2e-doctor-spec-Cardiologia',
        description: 'Especialidade do coração',
        isActive: true,
      },
    });
    createdSpecializationId = specialization.id;
  });

  describe('POST /doctor-specializations', () => {
    it('should create a new doctor-specialization link', async () => {
      const createDto = {
        doctorId: createdDoctorId,
        specializationId: createdSpecializationId,
      };

      const response = await request(app.getHttpServer())
        .post('/doctor-specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        doctorId: createDto.doctorId,
        specializationId: createDto.specializationId,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      createdDoctorSpecializationId = response.body.id;
    });

    it('should return 400 if doctorId is missing', async () => {
      const invalidDto = {
        specializationId: createdSpecializationId,
      };

      await request(app.getHttpServer())
        .post('/doctor-specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 if doctor not found', async () => {
      const invalidDto = {
        doctorId: 'non-existent-doctor-id',
        specializationId: createdSpecializationId,
      };

      await request(app.getHttpServer())
        .post('/doctor-specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 if specialization not found', async () => {
      const invalidDto = {
        doctorId: createdDoctorId,
        specializationId: 'non-existent-specialization-id',
      };

      await request(app.getHttpServer())
        .post('/doctor-specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 if link already exists', async () => {
      const createDto = {
        doctorId: createdDoctorId,
        specializationId: createdSpecializationId,
      };

      await request(app.getHttpServer())
        .post('/doctor-specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/doctor-specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should return 401 if not authenticated', async () => {
      const createDto = {
        doctorId: createdDoctorId,
        specializationId: createdSpecializationId,
      };

      await request(app.getHttpServer())
        .post('/doctor-specializations')
        .send(createDto)
        .expect(401);
    });
  });

  describe('GET /doctor-specializations/doctor/:doctorId', () => {
    beforeEach(async () => {
      await prisma.doctorSpecialization.create({
        data: {
          doctorId: createdDoctorId,
          specializationId: createdSpecializationId,
        },
      });
    });

    it('should return all specializations for a doctor', async () => {
      const response = await request(app.getHttpServer())
        .get(`/doctor-specializations/doctor/${createdDoctorId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].doctorId).toBe(createdDoctorId);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/doctor-specializations/doctor/${createdDoctorId}`)
        .expect(401);
    });
  });

  describe('GET /doctor-specializations/specialization/:specializationId', () => {
    beforeEach(async () => {
      await prisma.doctorSpecialization.create({
        data: {
          doctorId: createdDoctorId,
          specializationId: createdSpecializationId,
        },
      });
    });

    it('should return all doctors for a specialization', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/doctor-specializations/specialization/${createdSpecializationId}`,
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].specializationId).toBe(createdSpecializationId);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(
          `/doctor-specializations/specialization/${createdSpecializationId}`,
        )
        .expect(401);
    });
  });

  describe('DELETE /doctor-specializations/:id', () => {
    it('should delete a doctor-specialization link', async () => {
      const doctorSpec = await prisma.doctorSpecialization.create({
        data: {
          doctorId: createdDoctorId,
          specializationId: createdSpecializationId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/doctor-specializations/${doctorSpec.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);

      const deletedLink = await prisma.doctorSpecialization.findUnique({
        where: { id: doctorSpec.id },
      });

      expect(deletedLink).toBeNull();
    });

    it('should return 404 if link not found', async () => {
      await request(app.getHttpServer())
        .delete('/doctor-specializations/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/doctor-specializations/some-id')
        .expect(401);
    });
  });
});
