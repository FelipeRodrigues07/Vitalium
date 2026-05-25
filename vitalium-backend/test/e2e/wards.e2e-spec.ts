import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/modules/app.module';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { Role } from '../../src/shared/enums/role.enum';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { WardType } from '../../src/shared/enums/ward-type.enum';
import { AdmissionStatus } from '../../src/shared/enums/admission-status.enum';

describe('Wards API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;
  let unitId: string;
  let patientId: string;

  const adminEmail = 'test-e2e-ward-admin@example.com';
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
    await prisma.wardAdmission.deleteMany({
      where: { ward: { name: { contains: 'test-e2e-ward' } } },
    });
    await prisma.ward.deleteMany({
      where: { name: { contains: 'test-e2e-ward' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-ward' } } },
    });
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-ward' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-ward' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.wardAdmission.deleteMany({
      where: { ward: { name: { contains: 'test-e2e-ward' } } },
    });
    await prisma.ward.deleteMany({
      where: { name: { contains: 'test-e2e-ward' } },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: { contains: 'test-e2e-ward' } } },
    });
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-ward' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-ward' } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Ward',
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

    const unit = await prisma.unit.create({
      data: {
        name: 'test-e2e-ward-Unit',
        type: 'HOSPITAL',
        address: 'Rua Ala, 5',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05000001',
        cnpj: `${Date.now() + 2}`.padEnd(14, '0').slice(0, 14),
      },
    });
    unitId = unit.id;

    const patientUser = await prisma.user.create({
      data: {
        email: 'test-e2e-ward-patient@example.com',
        password: 'hashed',
        firstName: 'Paciente',
        lastName: 'Ala',
        isActive: true,
        role: Role.PATIENT,
      },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        birthDate: new Date('1975-03-20'),
        cpf: '11122233344',
        gender: 'MALE',
      },
    });
    patientId = patient.id;
  });

  // ─── POST /wards ───────────────────────────────────────────────────────────

  describe('POST /wards', () => {
    it('should create a ward', async () => {
      const response = await request(app.getHttpServer())
        .post('/wards')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          unitId,
          name: 'test-e2e-ward UTI',
          type: WardType.ICU,
          capacity: 10,
          floor: '3',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('test-e2e-ward UTI');
      expect(response.body.type).toBe(WardType.ICU);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/wards')
        .send({ unitId, name: 'x', type: WardType.GENERAL, capacity: 5 })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/wards')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ unitId })
        .expect(400);
    });
  });

  // ─── GET /wards/unit/:unitId ───────────────────────────────────────────────

  describe('GET /wards/unit/:unitId', () => {
    it('should return wards for a unit', async () => {
      await prisma.ward.create({
        data: {
          unitId,
          name: 'test-e2e-ward Geral',
          type: WardType.GENERAL,
          capacity: 20,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/wards/unit/${unitId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // ─── GET /wards/:id ────────────────────────────────────────────────────────

  describe('GET /wards/:id', () => {
    it('should return ward by id', async () => {
      const ward = await prisma.ward.create({
        data: {
          unitId,
          name: 'test-e2e-ward Single',
          type: WardType.PEDIATRIC,
          capacity: 15,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/wards/${ward.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(ward.id);
    });

    it('should return 404 for non-existent ward', async () => {
      await request(app.getHttpServer())
        .get('/wards/nonexistent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /wards/:id ─────────────────────────────────────────────────────

  describe('PATCH /wards/:id', () => {
    it('should update ward capacity', async () => {
      const ward = await prisma.ward.create({
        data: {
          unitId,
          name: 'test-e2e-ward Update',
          type: WardType.SURGERY,
          capacity: 8,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/wards/${ward.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ capacity: 16 })
        .expect(200);

      expect(response.body.capacity).toBe(16);
    });
  });

  // ─── DELETE /wards/:id ────────────────────────────────────────────────────

  describe('DELETE /wards/:id', () => {
    it('should delete a ward', async () => {
      const ward = await prisma.ward.create({
        data: {
          unitId,
          name: 'test-e2e-ward Delete',
          type: WardType.OTHER,
          capacity: 5,
        },
      });

      await request(app.getHttpServer())
        .delete(`/wards/${ward.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
    });
  });

  // ─── Ward Admissions ───────────────────────────────────────────────────────

  describe('Ward Admissions', () => {
    let wardId: string;

    beforeEach(async () => {
      const ward = await prisma.ward.create({
        data: {
          unitId,
          name: 'test-e2e-ward Admissoes',
          type: WardType.GENERAL,
          capacity: 30,
        },
      });
      wardId = ward.id;
    });

    describe('POST /ward-admissions', () => {
      it('should create a ward admission', async () => {
        const response = await request(app.getHttpServer())
          .post('/ward-admissions')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({
            patientId,
            wardId,
            reason: 'Internação de urgência',
            status: AdmissionStatus.ACTIVE,
          })
          .expect(201);

        expect(response.body.id).toBeDefined();
        expect(response.body.patientId).toBe(patientId);
        expect(response.body.wardId).toBe(wardId);
        expect(response.body.status).toBe(AdmissionStatus.ACTIVE);
      });

      it('should return 400 for missing required fields', async () => {
        await request(app.getHttpServer())
          .post('/ward-admissions')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({ patientId })
          .expect(400);
      });
    });

    describe('GET /ward-admissions/patient/:patientId', () => {
      it('should return admissions for a patient', async () => {
        await prisma.wardAdmission.create({
          data: {
            patientId,
            wardId,
            reason: 'Cirurgia',
            status: AdmissionStatus.ACTIVE,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/ward-admissions/patient/${patientId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    describe('GET /ward-admissions/ward/:wardId', () => {
      it('should return admissions for a ward', async () => {
        const response = await request(app.getHttpServer())
          .get(`/ward-admissions/ward/${wardId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /ward-admissions/:id', () => {
      it('should return admission by id', async () => {
        const admission = await prisma.wardAdmission.create({
          data: {
            patientId,
            wardId,
            reason: 'Observação',
            status: AdmissionStatus.ACTIVE,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/ward-admissions/${admission.id}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200);

        expect(response.body.id).toBe(admission.id);
      });

      it('should return 404 for non-existent admission', async () => {
        await request(app.getHttpServer())
          .get('/ward-admissions/nonexistent-id')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(404);
      });
    });

    describe('PATCH /ward-admissions/:id', () => {
      it('should update admission status', async () => {
        const admission = await prisma.wardAdmission.create({
          data: {
            patientId,
            wardId,
            reason: 'Alta',
            status: AdmissionStatus.ACTIVE,
          },
        });

        const response = await request(app.getHttpServer())
          .patch(`/ward-admissions/${admission.id}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({ status: AdmissionStatus.DISCHARGED })
          .expect(200);

        expect(response.body.status).toBe(AdmissionStatus.DISCHARGED);
      });
    });

    describe('DELETE /ward-admissions/:id', () => {
      it('should delete a ward admission', async () => {
        const admission = await prisma.wardAdmission.create({
          data: {
            patientId,
            wardId,
            reason: 'Para deletar',
            status: AdmissionStatus.TRANSFERRED,
          },
        });

        await request(app.getHttpServer())
          .delete(`/ward-admissions/${admission.id}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(204);
      });
    });
  });
});
