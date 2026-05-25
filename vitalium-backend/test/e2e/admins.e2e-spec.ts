import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { AppModule } from '../../src/modules/app.module';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { Role } from '../../src/shared/enums/role.enum';

describe('Admins API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;
  let nonAdminAccessToken: string;

  const adminEmail = 'test-e2e-admin-user@example.com';
  const superAdminEmail = 'test-e2e-admin-super@example.com';
  const patientEmail = 'test-e2e-admin-patient@example.com';
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
    await prisma.admin.deleteMany({
      where: { user: { email: { contains: 'test-e2e-admin' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-admin' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpa dados de teste
    await prisma.admin.deleteMany({
      where: { user: { email: { contains: 'test-e2e-admin' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-admin' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Super admin para autenticação (separado do adminEmail que é target dos testes)
    const superAdminUser = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        role: Role.ADMIN,
      },
    });
    await prisma.admin.create({
      data: {
        userId: superAdminUser.id,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    // Usuário com role ADMIN (target dos testes - sem perfil Admin)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Tester',
        isActive: true,
        role: Role.ADMIN,
      },
    });

    // Usuário sem role ADMIN (PATIENT)
    await prisma.user.create({
      data: {
        email: patientEmail,
        password: hashedPassword,
        firstName: 'Patient',
        lastName: 'Tester',
        isActive: true,
        role: Role.PATIENT,
      },
    });

    adminAccessToken = await loginAndGetToken(superAdminEmail);
    nonAdminAccessToken = await loginAndGetToken(patientEmail);
  });

  // ─── POST /admins ─────────────────────────────────────────────────────────────

  describe('POST /admins', () => {
    it('should create admin for a user with role ADMIN', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      const response = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.SUPER_ADMIN })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe(adminUser?.id);
      expect(response.body.role).toBe(AdminRole.SUPER_ADMIN);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 409 when admin already exists for user', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.SUPER_ADMIN })
        .expect(201);

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.CLINIC_ADMIN })
        .expect(409);
    });

    it('should return 400 when userId is missing', async () => {
      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: AdminRole.HOSPITAL_ADMIN })
        .expect(400);
    });

    it('should return 400 when role is invalid', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: 'INVALID_ROLE' })
        .expect(400);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/admins')
        .send({ userId: 'any-id', role: AdminRole.HOSPITAL_ADMIN })
        .expect(401);
    });

    it('should return 403 when user does not have ADMIN role', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${nonAdminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.HOSPITAL_ADMIN })
        .expect(403);
    });

    it('should return 404 when userId does not exist', async () => {
      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          userId: 'non-existent-user-id',
          role: AdminRole.HOSPITAL_ADMIN,
        })
        .expect(404);
    });

    it('should return 400 when user does not have role ADMIN', async () => {
      const patientUser = await prisma.user.findUnique({
        where: { email: patientEmail },
      });

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: patientUser?.id, role: AdminRole.HOSPITAL_ADMIN })
        .expect(400);
    });
  });

  // ─── GET /admins/:id ──────────────────────────────────────────────────────────

  describe('GET /admins/:id', () => {
    it('should return admin by id', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      const created = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.SUPER_ADMIN })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/admins/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(created.body.id);
      expect(response.body.role).toBe(AdminRole.SUPER_ADMIN);
    });

    it('should return 404 for non-existent admin', async () => {
      await request(app.getHttpServer())
        .get('/admins/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/admins/any-id').expect(401);
    });

    it('should return 403 when user does not have ADMIN role', async () => {
      await request(app.getHttpServer())
        .get('/admins/any-id')
        .set('Authorization', `Bearer ${nonAdminAccessToken}`)
        .expect(403);
    });
  });

  // ─── PATCH /admins/:id ────────────────────────────────────────────────────────

  describe('PATCH /admins/:id', () => {
    it('should update admin role', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      const created = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.SUPER_ADMIN })
        .expect(201);

      const response = await request(app.getHttpServer())
        .patch(`/admins/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: AdminRole.CLINIC_ADMIN })
        .expect(200);

      expect(response.body.role).toBe(AdminRole.CLINIC_ADMIN);
    });

    it('should update isActive to false', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      const created = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.SUPER_ADMIN })
        .expect(201);

      const response = await request(app.getHttpServer())
        .patch(`/admins/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should return 404 for non-existent admin', async () => {
      await request(app.getHttpServer())
        .patch('/admins/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: AdminRole.CLINIC_ADMIN })
        .expect(404);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .patch('/admins/any-id')
        .send({ role: AdminRole.CLINIC_ADMIN })
        .expect(401);
    });

    it('should return 403 when user does not have ADMIN role', async () => {
      await request(app.getHttpServer())
        .patch('/admins/any-id')
        .set('Authorization', `Bearer ${nonAdminAccessToken}`)
        .send({ role: AdminRole.CLINIC_ADMIN })
        .expect(403);
    });
  });

  // ─── DELETE /admins/:id ───────────────────────────────────────────────────────

  describe('DELETE /admins/:id', () => {
    it('should delete admin and return 204', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      const created = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ userId: adminUser?.id, role: AdminRole.SUPER_ADMIN })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/admins/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);

      // Confirm it no longer exists
      await request(app.getHttpServer())
        .get(`/admins/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent admin', async () => {
      await request(app.getHttpServer())
        .delete('/admins/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer()).delete('/admins/any-id').expect(401);
    });

    it('should return 403 when user does not have ADMIN role', async () => {
      await request(app.getHttpServer())
        .delete('/admins/any-id')
        .set('Authorization', `Bearer ${nonAdminAccessToken}`)
        .expect(403);
    });
  });
});
