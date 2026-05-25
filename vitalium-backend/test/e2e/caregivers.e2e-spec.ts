import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { CaregiverRelationship } from '../../src/shared/enums/caregiver-relationship.enum';

describe('Caregivers API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;
  let createdCaregiverId: string;

  const adminEmail = 'test-e2e-caregiver-admin@example.com';
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
    await prisma.caregiver.deleteMany({
      where: { user: { email: { contains: 'test-e2e-caregiver' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-caregiver' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.caregiver.deleteMany({
      where: { user: { email: { contains: 'test-e2e-caregiver' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-caregiver' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Caregiver',
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

  // ─── POST /caregivers ───────────────────────────────────────────────────────

  describe('POST /caregivers', () => {
    it('should create a caregiver with valid data', async () => {
      const caregiverUser = await prisma.user.create({
        data: {
          email: 'test-e2e-caregiver-user1@example.com',
          password: 'hashed',
          firstName: 'Maria',
          lastName: 'Cuidadora',
          isActive: true,
          role: Role.CAREGIVER,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/caregivers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          userId: caregiverUser.id,
          cpf: '12345678901',
          relationship: CaregiverRelationship.PARENT,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.cpf).toBe('12345678901');
      expect(response.body.relationship).toBe(CaregiverRelationship.PARENT);
      createdCaregiverId = response.body.id;
    });

    it('should return 400 when CPF has wrong format', async () => {
      const caregiverUser = await prisma.user.create({
        data: {
          email: 'test-e2e-caregiver-user2@example.com',
          password: 'hashed',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          role: Role.CAREGIVER,
        },
      });

      await request(app.getHttpServer())
        .post('/caregivers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          userId: caregiverUser.id,
          cpf: '123',
          relationship: CaregiverRelationship.PARENT,
        })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/caregivers')
        .send({
          userId: 'x',
          cpf: '12345678901',
          relationship: CaregiverRelationship.PARENT,
        })
        .expect(401);
    });
  });

  // ─── GET /caregivers ───────────────────────────────────────────────────────

  describe('GET /caregivers', () => {
    it('should list all caregivers', async () => {
      const response = await request(app.getHttpServer())
        .get('/caregivers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ─── GET /caregivers/:id ───────────────────────────────────────────────────

  describe('GET /caregivers/:id', () => {
    it('should return a caregiver by id', async () => {
      const caregiverUser = await prisma.user.create({
        data: {
          email: 'test-e2e-caregiver-user3@example.com',
          password: 'hashed',
          firstName: 'Joao',
          lastName: 'Cuidador',
          isActive: true,
          role: Role.CAREGIVER,
        },
      });
      const caregiver = await prisma.caregiver.create({
        data: {
          userId: caregiverUser.id,
          cpf: '98765432100',
          relationship: CaregiverRelationship.SPOUSE,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/caregivers/${caregiver.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(caregiver.id);
    });

    it('should return 404 for non-existent caregiver', async () => {
      await request(app.getHttpServer())
        .get('/caregivers/nonexistent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /caregivers/:id ─────────────────────────────────────────────────

  describe('PATCH /caregivers/:id', () => {
    it('should update caregiver relationship', async () => {
      const caregiverUser = await prisma.user.create({
        data: {
          email: 'test-e2e-caregiver-user4@example.com',
          password: 'hashed',
          firstName: 'Ana',
          lastName: 'Cuidadora',
          isActive: true,
          role: Role.CAREGIVER,
        },
      });
      const caregiver = await prisma.caregiver.create({
        data: {
          userId: caregiverUser.id,
          cpf: '11122233344',
          relationship: CaregiverRelationship.CHILD,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/caregivers/${caregiver.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ relationship: CaregiverRelationship.SIBLING })
        .expect(200);

      expect(response.body.relationship).toBe(CaregiverRelationship.SIBLING);
    });
  });

  // ─── DELETE /caregivers/:id ────────────────────────────────────────────────

  describe('DELETE /caregivers/:id', () => {
    it('should delete a caregiver', async () => {
      const caregiverUser = await prisma.user.create({
        data: {
          email: 'test-e2e-caregiver-user5@example.com',
          password: 'hashed',
          firstName: 'Pedro',
          lastName: 'Cuidador',
          isActive: true,
          role: Role.CAREGIVER,
        },
      });
      const caregiver = await prisma.caregiver.create({
        data: {
          userId: caregiverUser.id,
          cpf: '55566677788',
          relationship: CaregiverRelationship.GUARDIAN,
        },
      });

      await request(app.getHttpServer())
        .delete(`/caregivers/${caregiver.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent caregiver', async () => {
      await request(app.getHttpServer())
        .delete('/caregivers/nonexistent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
