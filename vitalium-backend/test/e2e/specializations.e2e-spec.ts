import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';

describe('Specializations API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let createdSpecializationId: string;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-specialization-admin@example.com';
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
    await prisma.specialization.deleteMany({
      where: {
        name: {
          contains: 'test-e2e-specialization',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-e2e-specialization',
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.specialization.deleteMany({
      where: { name: { contains: 'test-e2e-specialization' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-specialization' } },
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

  describe('POST /specializations', () => {
    it('should create a new specialization with valid data', async () => {
      const createSpecializationDto = {
        name: 'test-e2e-specialization-Cardiologia',
        description: 'Especialidade médica que cuida do coração',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createSpecializationDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createSpecializationDto.name,
        description: createSpecializationDto.description,
        isActive: createSpecializationDto.isActive,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      createdSpecializationId = response.body.id;
    });

    it('should return 400 if name is missing', async () => {
      const invalidDto = {
        description: 'Descrição sem nome',
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 if name already exists', async () => {
      const createSpecializationDto = {
        name: 'test-e2e-specialization-Neurologia',
        description: 'Especialidade neurológica',
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createSpecializationDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createSpecializationDto)
        .expect(400);
    });

    it('should return 401 if not authenticated', async () => {
      const createSpecializationDto = {
        name: 'test-e2e-specialization-Ortopedia',
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/specializations')
        .send(createSpecializationDto)
        .expect(401);
    });
  });

  describe('GET /specializations', () => {
    beforeEach(async () => {
      await prisma.specialization.create({
        data: {
          name: 'test-e2e-specialization-Pediatria',
          description: 'Especialidade pediátrica',
          isActive: true,
        },
      });
    });

    it('should return all active specializations', async () => {
      const response = await request(app.getHttpServer())
        .get('/specializations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/specializations').expect(401);
    });
  });

  describe('GET /specializations/:id', () => {
    it('should return a specialization by id', async () => {
      const specialization = await prisma.specialization.create({
        data: {
          name: 'test-e2e-specialization-Oftalmologia',
          description: 'Especialidade oftalmológica',
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/specializations/${specialization.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(specialization.id);
      expect(response.body.name).toBe(specialization.name);
    });

    it('should return 404 if specialization not found', async () => {
      await request(app.getHttpServer())
        .get('/specializations/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /specializations/:id', () => {
    it('should update a specialization', async () => {
      const specialization = await prisma.specialization.create({
        data: {
          name: 'test-e2e-specialization-Dermatologia',
          description: 'Descrição antiga',
          isActive: true,
        },
      });

      const updateDto = {
        description: 'Descrição atualizada',
      };

      const response = await request(app.getHttpServer())
        .patch(`/specializations/${specialization.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.description).toBe(updateDto.description);
    });

    it('should return 404 if specialization not found', async () => {
      const updateDto = { description: 'Nova descrição' };

      await request(app.getHttpServer())
        .patch('/specializations/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /specializations/:id', () => {
    it('should delete a specialization (soft delete)', async () => {
      const specialization = await prisma.specialization.create({
        data: {
          name: 'test-e2e-specialization-Psiquiatria',
          description: 'Especialidade psiquiátrica',
          isActive: true,
        },
      });

      await request(app.getHttpServer())
        .delete(`/specializations/${specialization.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);

      const deletedSpecialization = await prisma.specialization.findUnique({
        where: { id: specialization.id },
      });

      expect(deletedSpecialization?.isActive).toBe(false);
    });

    it('should return 404 if specialization not found', async () => {
      await request(app.getHttpServer())
        .delete('/specializations/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
