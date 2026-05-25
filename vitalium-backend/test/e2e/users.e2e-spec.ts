import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-users-admin@example.com';
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
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-user' } },
    });
    await prisma.user.deleteMany({
      where: { email: adminEmail },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-user' } },
    });
    await prisma.user.deleteMany({
      where: { email: adminEmail },
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

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const createUserDto = {
        email: 'test-e2e-user-create@example.com',
        password: 'TestPassword123!',
        firstName: 'João',
        lastName: 'Silva',
        phone: '11999999999',
        avatar: 'https://example.com/avatar.jpg',
        isActive: true,
        role: Role.PATIENT,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        avatar: createUserDto.avatar,
        isActive: createUserDto.isActive,
        role: createUserDto.role,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
      expect(response.body.password).toBeUndefined(); // Password should not be returned
    });

    it('should create a user without optional fields', async () => {
      const createUserDto = {
        email: 'test-e2e-user-minimal@example.com',
        password: 'TestPassword123!',
        firstName: 'Maria',
        lastName: 'Santos',
        isActive: true,
        role: Role.DOCTOR,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: createUserDto.isActive,
        role: createUserDto.role,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.phone).toBeUndefined();
      expect(response.body.avatar).toBeUndefined();
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUserDto = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'João',
        lastName: 'Silva',
        isActive: true,
        role: Role.PATIENT,
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 400 for invalid phone format', async () => {
      const invalidUserDto = {
        email: 'test-e2e-user-invalid-phone@example.com',
        password: 'TestPassword123!',
        firstName: 'João',
        lastName: 'Silva',
        phone: '123', // Invalid phone
        isActive: true,
        role: Role.PATIENT,
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUserDto = {
        email: 'test-e2e-user-incomplete@example.com',
        // Missing firstName, lastName, isActive, role, password
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(incompleteUserDto)
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      const createUserDto = {
        email: 'test-e2e-user-duplicate@example.com',
        password: 'TestPassword123!',
        firstName: 'João',
        lastName: 'Silva',
        isActive: true,
        role: Role.PATIENT,
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUserDto)
        .expect(201);

      // Try to create user with same email
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUserDto)
        .expect(409);
    });

    it('should create users with different roles', async () => {
      const roles = [
        Role.PATIENT,
        Role.DOCTOR,
        Role.NURSE,
        Role.CAREGIVER,
        Role.ADMIN,
      ];

      for (const [index, role] of roles.entries()) {
        const createUserDto = {
          email: `test-e2e-user-role-${role.toLowerCase()}@example.com`,
          password: 'TestPassword123!',
          firstName: 'Usuário',
          lastName: `Teste ${index}`,
          isActive: true,
          role: role,
        };

        const response = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send(createUserDto)
          .expect(201);

        expect(response.body.role).toBe(role);
      }
    });
  });
});
