import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../enums/role.enum';
import { AdminRole } from '../enums/admin-role.enum';
import { ValidationException } from '../execeptions/system/validation.exception';
import type { AuthJwtPayload } from '../types/auth-jwt-payload.interface';
import { ClinicMembershipService } from './clinic-membership.service';

describe('ClinicMembershipService', () => {
  let service: ClinicMembershipService;
  const patientRepository = { hasActiveUnitLink: jest.fn() };
  const doctorRepository = {
    hasActiveUnitLink: jest.fn(),
    findByUserId: jest.fn(),
  };

  const doctorUser: AuthJwtPayload = {
    sub: 'user-doctor-1',
    email: 'medico@vitalium.com',
    firstName: 'Medico',
    lastName: 'Um',
    role: Role.DOCTOR,
  };

  const adminUser: AuthJwtPayload = {
    sub: 'user-admin-1',
    email: 'admin@vitalium.com',
    firstName: 'Admin',
    lastName: 'Um',
    role: Role.ADMIN,
    adminRole: AdminRole.SUPER_ADMIN,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicMembershipService,
        { provide: 'IPatientRepository', useValue: patientRepository },
        { provide: 'IDoctorRepository', useValue: doctorRepository },
      ],
    }).compile();

    service = module.get(ClinicMembershipService);
  });

  it('should pass when doctor and patient belong to the unit', async () => {
    patientRepository.hasActiveUnitLink.mockResolvedValue(true);
    doctorRepository.hasActiveUnitLink.mockResolvedValue(true);

    await expect(
      service.assertDoctorAndPatientInUnit(
        'doctor-1',
        'patient-1',
        'unit-1',
      ),
    ).resolves.toBeUndefined();
  });

  it('should throw when the patient is not in the unit', async () => {
    patientRepository.hasActiveUnitLink.mockResolvedValue(false);
    doctorRepository.hasActiveUnitLink.mockResolvedValue(true);

    await expect(
      service.assertDoctorAndPatientInUnit(
        'doctor-1',
        'patient-1',
        'unit-1',
      ),
    ).rejects.toThrow(ValidationException);
  });

  it('should throw when the doctor is not in the unit', async () => {
    patientRepository.hasActiveUnitLink.mockResolvedValue(true);
    doctorRepository.hasActiveUnitLink.mockResolvedValue(false);

    await expect(
      service.assertDoctorAndPatientInUnit(
        'doctor-1',
        'patient-1',
        'unit-1',
      ),
    ).rejects.toThrow(ValidationException);
  });

  it('should require unitId on doctor listings', async () => {
    await expect(
      service.resolveDoctorListUnitId(doctorUser, undefined),
    ).rejects.toThrow(ValidationException);
  });

  it('should keep unitId optional for admin listings', async () => {
    await expect(
      service.resolveDoctorListUnitId(adminUser, undefined),
    ).resolves.toBeUndefined();
  });

  it('should reject doctor access to a record from another unit', async () => {
    doctorRepository.findByUserId.mockResolvedValue({ id: 'doctor-1' });
    doctorRepository.hasActiveUnitLink.mockResolvedValue(true);

    await expect(
      service.assertCanAccessUnitRecord(
        doctorUser,
        'clinic-unit',
        'hospital-unit',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should allow doctor access when the record belongs to the requested unit', async () => {
    doctorRepository.findByUserId.mockResolvedValue({ id: 'doctor-1' });
    doctorRepository.hasActiveUnitLink.mockResolvedValue(true);

    await expect(
      service.assertCanAccessUnitRecord(
        doctorUser,
        'hospital-unit',
        'hospital-unit',
      ),
    ).resolves.toBeUndefined();
  });
});
