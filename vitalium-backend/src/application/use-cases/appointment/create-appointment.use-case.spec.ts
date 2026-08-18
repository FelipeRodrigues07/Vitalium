import { Test, TestingModule } from '@nestjs/testing';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';
import { AppointmentType } from '../../../shared/enums/appointment-type.enum';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { CreateAppointmentUseCase } from './create-appointment.use-case';

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;
  let repo: jest.Mocked<IAppointmentRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAppointmentUseCase,
        {
          provide: ClinicMembershipService,
          useValue: {
            assertDoctorAndPatientInUnit: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: 'IAppointmentRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByDoctorId: jest.fn(),
            findByUnitId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateAppointmentUseCase>(CreateAppointmentUseCase);
    repo = module.get('IAppointmentRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      patientId: 'patient-id-1',
      doctorId: 'doctor-id-1',
      unitId: 'unit-id-1',
      title: 'Consulta Geral',
      scheduledAt: '2027-06-01T09:00:00.000Z',
      status: AppointmentStatus.SCHEDULED,
      type: AppointmentType.CONSULTATION,
    } as any;

    it('should create an appointment successfully', async () => {
      repo.findByDoctorId.mockResolvedValue([]);
      repo.create.mockResolvedValue(mockAppointment);

      const result = await useCase.execute(validDTO);

      expect(repo.findByDoctorId).toHaveBeenCalledWith(validDTO.doctorId);
      expect(repo.create).toHaveBeenCalledWith(validDTO);
      expect(result).toEqual(mockAppointment);
    });

    it('should throw on schedule conflict', async () => {
      repo.findByDoctorId.mockResolvedValue([mockAppointment]);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        'Já existe uma consulta neste horário',
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw DatabaseException on repository error', async () => {
      repo.findByDoctorId.mockResolvedValue([]);
      repo.create.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
