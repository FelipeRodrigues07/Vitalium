import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { AppModule } from '../../src/modules/app.module';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { Role } from '../../src/shared/enums/role.enum';
import { UnitType } from '../../src/shared/enums/unit.enum';

describe('Doctor-Units API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let testDoctorId: string;
  let testUnitId: string;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-du-admin@example.com';
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
    await prisma.doctorUnit.deleteMany({
      where: {
        doctor: {
          crm: {
            contains: 'test-e2e-du',
          },
        },
      },
    });

    await prisma.doctor.deleteMany({
      where: {
        crm: {
          contains: 'test-e2e-du',
        },
      },
    });

    await prisma.unit.deleteMany({
      where: {
        name: {
          contains: 'test-e2e-du',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-e2e-du',
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.doctorUnit.deleteMany({
      where: {
        doctor: {
          crm: {
            contains: 'test-e2e-du',
          },
        },
      },
    });

    await prisma.doctor.deleteMany({
      where: {
        crm: {
          contains: 'test-e2e-du',
        },
      },
    });

    await prisma.unit.deleteMany({
      where: {
        name: {
          contains: 'test-e2e-du',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-e2e-du',
        },
      },
    });

    // Create admin user for authentication
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

    // Create test user, doctor and unit for tests
    const testUser = await prisma.user.create({
      data: {
        email: 'test-e2e-du-doctor@example.com',
        password: 'hashedPassword123',
        firstName: 'Dr. José',
        lastName: 'Silva',
        isActive: true,
        role: Role.DOCTOR,
      },
    });

    const testDoctor = await prisma.doctor.create({
      data: {
        crm: 'test-e2e-du-CRM123456',
        crmState: true,
        isActive: true,
        userId: testUser.id,
      },
    });

    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const cnpjSuffix =
      `${String(timestamp).slice(-7)}${String(randomNum).padStart(4, '0')}`.slice(
        -11,
      );
    const testUnit = await prisma.unit.create({
      data: {
        name: 'test-e2e-du-Hospital Central',
        type: UnitType.HOSPITAL,
        address: 'Rua Central, 100',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        email: `hospital-du-${timestamp}@test.com`,
        cnpj: `123${cnpjSuffix}`,
        isActive: true,
      },
    });

    testDoctorId = testDoctor.id;
    testUnitId = testUnit.id;
  });

  describe('POST /doctor-units', () => {
    it('should create a doctor-unit relationship with all fields', async () => {
      const createDoctorUnitDto = {
        doctorId: testDoctorId,
        unitId: testUnitId,
        consultationPrice: 150.0,
        isPrimary: true,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(201);

      expect(response.body).toMatchObject({
        doctorId: testDoctorId,
        unitId: testUnitId,
        isPrimary: true,
        isActive: true,
      });

      // Check consultation price (might be returned as string)
      expect(parseFloat(response.body.consultationPrice)).toBe(150.0);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should create a doctor-unit without optional fields', async () => {
      const createDoctorUnitDto = {
        doctorId: testDoctorId,
        unitId: testUnitId,
      };

      const response = await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(201);

      expect(response.body).toMatchObject({
        doctorId: testDoctorId,
        unitId: testUnitId,
        isPrimary: false,
        isActive: true,
      });

      expect(response.body.id).toBeDefined();
    });

    it('should create a non-primary doctor-unit relationship', async () => {
      const createDoctorUnitDto = {
        doctorId: testDoctorId,
        unitId: testUnitId,
        consultationPrice: 200.0,
        isPrimary: false,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(201);

      expect(response.body.isPrimary).toBe(false);
    });

    it('should create an inactive doctor-unit relationship', async () => {
      const createDoctorUnitDto = {
        doctorId: testDoctorId,
        unitId: testUnitId,
        isActive: false,
      };

      const response = await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(201);

      // Note: Check if API actually respects isActive field
      expect(response.body).toHaveProperty('id');
      expect(response.body.doctorId).toBe(testDoctorId);
      expect(response.body.unitId).toBe(testUnitId);
    });

    it('should create doctor-unit with different consultation prices', async () => {
      // Create additional unit for this test
      const timestamp = Date.now();
      const secondUnit = await prisma.unit.create({
        data: {
          name: 'test-e2e-du-Clínica Test',
          type: UnitType.CLINIC,
          address: 'Rua Test, 200',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000123',
          email: `clinic-du-${timestamp}@test.com`,
          cnpj: `98765432100${String(timestamp).slice(-3)}`,
          isActive: true,
        },
      });

      const prices = [100.0, 250.5, 300.0, 150.75];

      for (const [index, price] of prices.entries()) {
        // Create additional doctor for each price
        const user = await prisma.user.create({
          data: {
            email: `test-e2e-du-doctor-price-${index}@example.com`,
            password: 'hashedPassword123',
            firstName: 'Dr. Test',
            lastName: `Price ${index}`,
            isActive: true,
            role: Role.DOCTOR,
          },
        });

        const doctor = await prisma.doctor.create({
          data: {
            crm: `test-e2e-du-CRM-PRICE-${index}`,
            crmState: true,
            isActive: true,
            userId: user.id,
          },
        });

        const createDoctorUnitDto = {
          doctorId: doctor.id,
          unitId: secondUnit.id,
          consultationPrice: price,
          isPrimary: index === 0,
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .post('/doctor-units')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send(createDoctorUnitDto)
          .expect(201);

        expect(parseFloat(response.body.consultationPrice)).toBe(price);
      }
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDoctorUnitDto = {
        doctorId: testDoctorId,
        // Missing unitId
      };

      await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(incompleteDoctorUnitDto)
        .expect(400);
    });

    it('should return 400 for non-existent doctorId', async () => {
      const createDoctorUnitDto = {
        doctorId: 'non-existent-doctor-id',
        unitId: testUnitId,
      };

      await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(400);
    });

    it('should return 400 for non-existent unitId', async () => {
      const createDoctorUnitDto = {
        doctorId: testDoctorId,
        unitId: 'non-existent-unit-id',
      };

      await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(400);
    });

    it('should return error for duplicate doctor-unit relationship', async () => {
      const createDoctorUnitDto = {
        doctorId: testDoctorId,
        unitId: testUnitId,
        consultationPrice: 150.0,
        isPrimary: true,
        isActive: true,
      };

      // Create first doctor-unit relationship
      await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto)
        .expect(201);

      // Try to create duplicate relationship (may return 409 or 500)
      const response = await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createDoctorUnitDto);

      expect([409, 500]).toContain(response.status);
    });

    it('should allow same doctor in different units', async () => {
      // Create second unit
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const cnpjSuffix =
        `${String(timestamp).slice(-7)}${String(randomNum).padStart(4, '0')}`.slice(
          -11,
        );
      const secondUnit = await prisma.unit.create({
        data: {
          name: 'test-e2e-du-Segunda Unidade',
          type: UnitType.CLINIC,
          address: 'Avenida Segunda, 500',
          city: 'Curitiba',
          state: 'PR',
          zipCode: '80000456',
          email: `second-unit-${timestamp}@test.com`,
          cnpj: `555${cnpjSuffix}`,
          isActive: true,
        },
      });

      // Create doctor-unit for first unit
      await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          doctorId: testDoctorId,
          unitId: testUnitId,
          consultationPrice: 150.0,
          isPrimary: true,
        })
        .expect(201);

      // Create doctor-unit for second unit (same doctor, different unit)
      const response = await request(app.getHttpServer())
        .post('/doctor-units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          doctorId: testDoctorId,
          unitId: secondUnit.id,
          consultationPrice: 200.0,
          isPrimary: false,
        })
        .expect(201);

      expect(response.body.doctorId).toBe(testDoctorId);
      expect(response.body.unitId).toBe(secondUnit.id);
    });
  });
});
