import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';

describe('Patients API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-patient-admin@example.com';
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
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-patient' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-patient' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-patient' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-patient' } },
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

  describe('POST /patients', () => {
    it('should create a new patient with valid data', async () => {
      const patientUser = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user1@example.com',
          password: 'hashedPassword123',
          firstName: 'Maria',
          lastName: 'Silva',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      const createDTO = {
        userId: patientUser.id,
        cpf: '12345678901',
        birthDate: '1990-05-15',
        gender: 'MALE',
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDTO)
        .expect(201);

      expect(response.body).toMatchObject({
        userId: patientUser.id,
        cpf: '12345678901',
        gender: 'MALE',
        isActive: true,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ cpf: '12345678901' })
        .expect(400);
    });

    it('should return 400 for invalid CPF format', async () => {
      const patientUser = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user2@example.com',
          password: 'hashedPassword123',
          firstName: 'João',
          lastName: 'Souza',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          userId: patientUser.id,
          cpf: '123',
          birthDate: '1990-05-15',
          gender: 'MALE',
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/patients')
        .send({
          userId: 'any',
          cpf: '12345678901',
          birthDate: '1990-05-15',
          gender: 'MALE',
        })
        .expect(401);
    });

    it('should return 409 for duplicate CPF', async () => {
      const user1 = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user3@example.com',
          password: 'hashedPassword123',
          firstName: 'Ana',
          lastName: 'Costa',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      // Create first patient
      await prisma.patient.create({
        data: {
          userId: user1.id,
          cpf: '99988877766',
          birthDate: new Date('1985-03-20'),
          gender: 'FEMALE',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user4@example.com',
          password: 'hashedPassword123',
          firstName: 'Bia',
          lastName: 'Ferreira',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          userId: user2.id,
          cpf: '99988877766',
          birthDate: '1990-05-15',
          gender: 'FEMALE',
        })
        .expect(409);
    });
  });

  describe('GET /patients', () => {
    it('should return list of patients', async () => {
      const patientUser = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user5@example.com',
          password: 'hashedPassword123',
          firstName: 'Carlos',
          lastName: 'Oliveira',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      await prisma.patient.create({
        data: {
          userId: patientUser.id,
          cpf: '11122233344',
          birthDate: new Date('1980-01-10'),
          gender: 'MALE',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/patients').expect(401);
    });
  });

  describe('GET /patients/:id', () => {
    it('should return a patient by id', async () => {
      const patientUser = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user6@example.com',
          password: 'hashedPassword123',
          firstName: 'Lucia',
          lastName: 'Mendes',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      const created = await prisma.patient.create({
        data: {
          userId: patientUser.id,
          cpf: '55566677788',
          birthDate: new Date('1995-07-22'),
          gender: 'FEMALE',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/patients/${created.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(created.id);
      expect(response.body.cpf).toBe('55566677788');
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .get('/patients/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /patients/:id', () => {
    it('should update patient data', async () => {
      const patientUser = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user7@example.com',
          password: 'hashedPassword123',
          firstName: 'Pedro',
          lastName: 'Alves',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      const created = await prisma.patient.create({
        data: {
          userId: patientUser.id,
          cpf: '44455566677',
          birthDate: new Date('1988-11-05'),
          gender: 'MALE',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/patients/${created.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ allergies: 'Dipirona', city: 'São Paulo', state: 'SP' })
        .expect(200);

      expect(response.body.allergies).toBe('Dipirona');
      expect(response.body.city).toBe('São Paulo');
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .patch('/patients/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ allergies: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /patients/:id', () => {
    it('should soft-delete a patient', async () => {
      const patientUser = await prisma.user.create({
        data: {
          email: 'test-e2e-patient-user8@example.com',
          password: 'hashedPassword123',
          firstName: 'Roberto',
          lastName: 'Nunes',
          isActive: true,
          role: Role.PATIENT,
        },
      });

      const created = await prisma.patient.create({
        data: {
          userId: patientUser.id,
          cpf: '33344455566',
          birthDate: new Date('1975-03-15'),
          gender: 'MALE',
        },
      });

      await request(app.getHttpServer())
        .delete(`/patients/${created.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);

      // Confirm soft-delete: record still exists but isActive=false
      const inDb = await prisma.patient.findUnique({
        where: { id: created.id },
      });
      expect(inDb?.isActive).toBe(false);
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .delete('/patients/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
