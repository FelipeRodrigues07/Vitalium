import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaProvider } from '../../src/infrastructure/database/prisma.provider';
import { AppModule } from '../../src/modules/app.module';
import { AdminRole } from '../../src/shared/enums/admin-role.enum';
import { Role } from '../../src/shared/enums/role.enum';
import { UnitType } from '../../src/shared/enums/unit.enum';

describe('Units API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let adminAccessToken: string;

  const adminEmail = 'test-e2e-unit-admin@example.com';
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
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-unit' } },
    });
    await prisma.user.deleteMany({
      where: { email: adminEmail },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.unit.deleteMany({
      where: { name: { contains: 'test-e2e-unit' } },
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

  describe('POST /units', () => {
    it('should create a new unit with all fields', async () => {
      const timestamp = Date.now();
      const createUnitDto = {
        name: 'test-e2e-unit-Hospital São Paulo',
        type: UnitType.HOSPITAL,
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        phone: '11999999999',
        email: `hospital-${timestamp}@test-e2e-unit.com`,
        cnpj: `1234567800019${timestamp.toString().slice(-1)}`,
      };

      const response = await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUnitDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createUnitDto.name,
        type: createUnitDto.type,
        address: createUnitDto.address,
        city: createUnitDto.city,
        state: createUnitDto.state,
        zipCode: createUnitDto.zipCode,
        phone: createUnitDto.phone,
        email: createUnitDto.email,
        cnpj: createUnitDto.cnpj,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
      expect(response.body.isActive).toBe(true);
    });

    it('should create a clinic unit', async () => {
      const timestamp = Date.now();
      const createUnitDto = {
        name: 'test-e2e-unit-Clínica Cardiologia',
        type: UnitType.CLINIC,
        address: 'Avenida Central, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000123',
        phone: '21988888888',
        email: `clinic-${timestamp}@test-e2e-unit.com`,
        cnpj: `9876543210019${timestamp.toString().slice(-1)}`,
      };

      const response = await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUnitDto)
        .expect(201);

      expect(response.body.type).toBe(UnitType.CLINIC);
      expect(response.body.name).toBe(createUnitDto.name);
    });

    it('should create a consulting room unit', async () => {
      const timestamp = Date.now();
      const createUnitDto = {
        name: 'test-e2e-unit-Consultório Dr. Silva',
        type: UnitType.CONSULTING_ROOM,
        address: 'Rua dos Médicos, 789',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30100456',
        email: `consulting-${timestamp}@test-e2e-unit.com`,
        cnpj: `1122334455019${timestamp.toString().slice(-1)}`,
      };

      const response = await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUnitDto)
        .expect(201);

      expect(response.body.type).toBe(UnitType.CONSULTING_ROOM);
      expect(response.body.phone).toBeUndefined();
    });

    it('should return 400 for invalid zipCode format', async () => {
      const timestamp = Date.now();
      const invalidUnitDto = {
        name: 'test-e2e-unit-Invalid',
        type: UnitType.HOSPITAL,
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '123', // Invalid - must be 8 digits
        email: `invalid-${timestamp}@test-e2e-unit.com`,
        cnpj: `12345678000190`,
      };

      await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidUnitDto)
        .expect(400);
    });

    it('should return 400 for invalid CNPJ format', async () => {
      const timestamp = Date.now();
      const invalidUnitDto = {
        name: 'test-e2e-unit-Invalid-CNPJ',
        type: UnitType.CLINIC,
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        email: `invalid-cnpj-${timestamp}@test-e2e-unit.com`,
        cnpj: '123', // Invalid - must be 14 digits
      };

      await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidUnitDto)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUnitDto = {
        name: 'test-e2e-unit-Invalid-Email',
        type: UnitType.HOSPITAL,
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        email: 'invalid-email', // Invalid email
        cnpj: '12345678000190',
      };

      await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidUnitDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUnitDto = {
        name: 'test-e2e-unit-Incomplete',
        // Missing type, address, city, state, zipCode, email, cnpj
      };

      await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(incompleteUnitDto)
        .expect(400);
    });

    it('should return 409 for duplicate CNPJ', async () => {
      const timestamp = Date.now();
      const createUnitDto = {
        name: 'test-e2e-unit-Duplicate',
        type: UnitType.HOSPITAL,
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        email: `duplicate-${timestamp}@test-e2e-unit.com`,
        cnpj: '12345678000199', // Same CNPJ
      };

      // Create first unit
      await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUnitDto)
        .expect(201);

      // Try to create unit with same CNPJ
      const duplicateUnitDto = {
        ...createUnitDto,
        name: 'test-e2e-unit-Duplicate-2',
        email: `duplicate2-${timestamp}@test-e2e-unit.com`,
      };

      await request(app.getHttpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(duplicateUnitDto)
        .expect(409);
    });

    it('should create units with different types', async () => {
      const unitTypes = [
        UnitType.HOSPITAL,
        UnitType.CLINIC,
        UnitType.CONSULTING_ROOM,
        UnitType.LAB,
        UnitType.OTHER,
      ];

      for (const [index, type] of unitTypes.entries()) {
        const timestamp = Date.now() + index;
        // Generate unique 14-digit CNPJ using timestamp
        const cnpjBase = String(timestamp).slice(-10); // 10 digits from timestamp
        const cnpj = `${cnpjBase}${String(1000 + index).slice(-4)}`; // Add 4 more digits

        const createUnitDto = {
          name: `test-e2e-unit-${type}`,
          type: type,
          address: `Endereço ${index}`,
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567',
          email: `unit-${type.toLowerCase()}-${timestamp}@test-e2e-unit.com`,
          cnpj: cnpj,
        };

        const response = await request(app.getHttpServer())
          .post('/units')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send(createUnitDto)
          .expect(201);

        expect(response.body.type).toBe(type);
      }
    });
  });
});
