import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';

describe('Doctors API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let createdUserId: string;
  let createdDoctorId: string;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-doctor-admin@example.com';
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

    // Configure validation pipe
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
    // Clean up test data
    await prisma.doctor.deleteMany({
      where: {
        crm: {
          contains: 'test-e2e-doctor',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-e2e-doctor',
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.doctor.deleteMany({
      where: { crm: { contains: 'test-e2e-doctor' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-doctor' } },
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
  });

  describe('POST /doctors', () => {
    it('should create a new doctor with valid data', async () => {
      // First create a user with DOCTOR role
      const testUser = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-user1@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. João',
          lastName: 'Silva',
          phone: '11999999999',
          isActive: true,
          role: Role.DOCTOR,
        },
      });
      createdUserId = testUser.id;

      const createDoctorDto = {
        crm: 'test-e2e-doctor-CRM123456',
        crmState: true,
        isActive: true,
        userId: createdUserId,
      };

      const response = await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorDto)
        .expect(201);

      expect(response.body).toMatchObject({
        crm: createDoctorDto.crm,
        crmState: createDoctorDto.crmState,
        isActive: createDoctorDto.isActive,
        userId: createdUserId,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      createdDoctorId = response.body.id;
    });

    it('should create a doctor with CRM state false', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-user2@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. Maria',
          lastName: 'Santos',
          isActive: true,
          role: Role.DOCTOR,
        },
      });

      const createDoctorDto = {
        crm: 'test-e2e-doctor-CRM789012',
        crmState: false,
        isActive: true,
        userId: testUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorDto)
        .expect(201);

      expect(response.body.crmState).toBe(false);
      expect(response.body.crm).toBe(createDoctorDto.crm);
    });

    it('should create an inactive doctor', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-user3@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. Carlos',
          lastName: 'Oliveira',
          isActive: true,
          role: Role.DOCTOR,
        },
      });

      const createDoctorDto = {
        crm: 'test-e2e-doctor-CRM345678',
        crmState: true,
        isActive: false,
        userId: testUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorDto)
        .expect(201);

      expect(response.body.isActive).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDoctorDto = {
        crm: 'test-e2e-doctor-CRM999999',
        // Missing crmState, isActive, userId
      };

      await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(incompleteDoctorDto)
        .expect(400);
    });

    it('should return 404 for non-existent userId', async () => {
      const createDoctorDto = {
        crm: 'test-e2e-doctor-CRM111111',
        crmState: true,
        isActive: true,
        userId: 'non-existent-user-id',
      };

      await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorDto)
        .expect(404);
    });

    it('should return 409 for duplicate CRM', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-user4@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. Ana',
          lastName: 'Costa',
          isActive: true,
          role: Role.DOCTOR,
        },
      });

      const createDoctorDto = {
        crm: 'test-e2e-doctor-CRM555555',
        crmState: true,
        isActive: true,
        userId: testUser.id,
      };

      // Create first doctor
      await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorDto)
        .expect(201);

      // Create another user
      const testUser2 = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-user5@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. Paulo',
          lastName: 'Lima',
          isActive: true,
          role: Role.DOCTOR,
        },
      });

      // Try to create doctor with same CRM
      const duplicateDoctorDto = {
        ...createDoctorDto,
        userId: testUser2.id,
      };

      await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(duplicateDoctorDto)
        .expect(409);
    });

    it('should return 409 for duplicate userId', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-user6@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. Pedro',
          lastName: 'Alves',
          isActive: true,
          role: Role.DOCTOR,
        },
      });

      const createDoctorDto = {
        crm: 'test-e2e-doctor-CRM666666',
        crmState: true,
        isActive: true,
        userId: testUser.id,
      };

      // Create first doctor
      await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorDto)
        .expect(201);

      // Try to create another doctor with same userId
      const duplicateDoctorDto = {
        crm: 'test-e2e-doctor-CRM777777',
        crmState: true,
        isActive: true,
        userId: testUser.id, // Same userId
      };

      await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(duplicateDoctorDto)
        .expect(409);
    });
  });

  describe('GET /doctors/:id', () => {
    beforeEach(async () => {
      // Create a user and doctor for GET tests
      const testUser = await prisma.user.create({
        data: {
          email: 'test-e2e-doctor-get-user@example.com',
          password: 'hashedPassword123',
          firstName: 'Dr. Roberto',
          lastName: 'Mendes',
          phone: '11988888888',
          isActive: true,
          role: Role.DOCTOR,
        },
      });

      const testDoctor = await prisma.doctor.create({
        data: {
          crm: 'test-e2e-doctor-CRM888888',
          crmState: true,
          isActive: true,
          userId: testUser.id,
        },
      });

      createdUserId = testUser.id;
      createdDoctorId = testDoctor.id;
    });

    it('should return doctor by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/doctors/${createdDoctorId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdDoctorId,
        crm: 'test-e2e-doctor-CRM888888',
        crmState: true,
        isActive: true,
        userId: createdUserId,
      });

      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent doctor', async () => {
      const nonExistentId = 'clxyz-non-existent-id';

      await request(app.getHttpServer())
        .get(`/doctors/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should return doctor with user information', async () => {
      const response = await request(app.getHttpServer())
        .get(`/doctors/${createdDoctorId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdDoctorId);
      // Depending on your DTO, it might include user information
      expect(response.body.userId).toBe(createdUserId);
    });
  });
});
