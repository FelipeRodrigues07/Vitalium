import { Test, TestingModule } from '@nestjs/testing';
import { SearchAppointmentUseCase } from './search-appointment.use-case';
import { UpdateAppointmentUseCase } from './update-appointment.use-case';
import { DeleteAppointmentUseCase } from './delete-appointment.use-case';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { AppointmentNotFoundException } from '../../../shared/execeptions/appointment/appointment-not-found.exception';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';
import { AppointmentType } from '../../../shared/enums/appointment-type.enum';

const mockAppointment = {
  id: 'appointment-id-1',
  patientId: 'patient-id-1',
  doctorId: 'doctor-id-1',
  unitId: 'unit-id-1',
  title: 'Consulta Geral',
  scheduledAt: '2027-06-01T09:00:00.000Z',
  duration: 30,
  status: AppointmentStatus.SCHEDULED,
  type: AppointmentType.CONSULTATION,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockRepoValue = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPatientId: jest.fn(),
  findByDoctorId: jest.fn(),
  findByUnitId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// ─── SearchAppointmentUseCase ────────────────────────────────────────────────

describe('SearchAppointmentUseCase', () => {
  let useCase: SearchAppointmentUseCase;
  let repo: jest.Mocked<IAppointmentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchAppointmentUseCase,
        { provide: 'IAppointmentRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<SearchAppointmentUseCase>(SearchAppointmentUseCase);
    repo = module.get('IAppointmentRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return appointment when found', async () => {
      repo.findById.mockResolvedValue(mockAppointment);
      const result = await useCase.findById('appointment-id-1');
      expect(result).toEqual(mockAppointment);
    });

    it('should throw AppointmentNotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.findById('nonexistent')).rejects.toThrow(
        AppointmentNotFoundException,
      );
    });

    it('should throw DatabaseException on repository error', async () => {
      repo.findById.mockRejectedValue(new Error('DB error'));
      await expect(useCase.findById('appointment-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });

  describe('findByPatientId', () => {
    it('should return appointments for a patient', async () => {
      repo.findByPatientId.mockResolvedValue([mockAppointment]);
      const result = await useCase.findByPatientId('patient-id-1');
      expect(result).toEqual([mockAppointment]);
    });
  });

  describe('findByDoctorId', () => {
    it('should return appointments for a doctor', async () => {
      repo.findByDoctorId.mockResolvedValue([mockAppointment]);
      const result = await useCase.findByDoctorId('doctor-id-1');
      expect(result).toEqual([mockAppointment]);
    });
  });

  describe('findByUnitId', () => {
    it('should return appointments for a unit', async () => {
      repo.findByUnitId.mockResolvedValue([mockAppointment]);
      const result = await useCase.findByUnitId('unit-id-1');
      expect(result).toEqual([mockAppointment]);
    });
  });
});

// ─── UpdateAppointmentUseCase ────────────────────────────────────────────────

describe('UpdateAppointmentUseCase', () => {
  let useCase: UpdateAppointmentUseCase;
  let repo: jest.Mocked<IAppointmentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAppointmentUseCase,
        { provide: 'IAppointmentRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<UpdateAppointmentUseCase>(UpdateAppointmentUseCase);
    repo = module.get('IAppointmentRepository');
  });

  it('should update appointment when found', async () => {
    const updated = { ...mockAppointment, status: AppointmentStatus.CONFIRMED };
    repo.findById.mockResolvedValue(mockAppointment);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('appointment-id-1', {
      status: AppointmentStatus.CONFIRMED,
    });

    expect(result.status).toBe(AppointmentStatus.CONFIRMED);
  });

  it('should throw AppointmentNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('nonexistent', { status: AppointmentStatus.CANCELLED }),
    ).rejects.toThrow(AppointmentNotFoundException);
  });
});

// ─── DeleteAppointmentUseCase ────────────────────────────────────────────────

describe('DeleteAppointmentUseCase', () => {
  let useCase: DeleteAppointmentUseCase;
  let repo: jest.Mocked<IAppointmentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAppointmentUseCase,
        { provide: 'IAppointmentRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<DeleteAppointmentUseCase>(DeleteAppointmentUseCase);
    repo = module.get('IAppointmentRepository');
  });

  it('should delete appointment when found', async () => {
    repo.findById.mockResolvedValue(mockAppointment);
    repo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('appointment-id-1')).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith('appointment-id-1');
  });

  it('should throw AppointmentNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      AppointmentNotFoundException,
    );
  });
});
