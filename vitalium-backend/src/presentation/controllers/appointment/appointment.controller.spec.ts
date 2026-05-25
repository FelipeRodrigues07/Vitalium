import { Test, TestingModule } from '@nestjs/testing';
import { CreateAppointmentUseCase } from '../../../application/use-cases/appointment/create-appointment.use-case';
import { DeleteAppointmentUseCase } from '../../../application/use-cases/appointment/delete-appointment.use-case';
import { SearchAppointmentUseCase } from '../../../application/use-cases/appointment/search-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../../application/use-cases/appointment/update-appointment.use-case';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';
import { AppointmentType } from '../../../shared/enums/appointment-type.enum';
import { AppointmentNotFoundException } from '../../../shared/execeptions/appointment/appointment-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AppointmentController } from './appointment.controller';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let createUseCase: jest.Mocked<CreateAppointmentUseCase>;
  let searchUseCase: jest.Mocked<SearchAppointmentUseCase>;
  let updateUseCase: jest.Mocked<UpdateAppointmentUseCase>;
  let deleteUseCase: jest.Mocked<DeleteAppointmentUseCase>;

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
      controllers: [AppointmentController],
      providers: [
        { provide: CreateAppointmentUseCase, useValue: { execute: jest.fn() } },
        {
          provide: SearchAppointmentUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByDoctorId: jest.fn(),
            findByUnitId: jest.fn(),
          },
        },
        { provide: UpdateAppointmentUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteAppointmentUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AppointmentController>(AppointmentController);
    createUseCase = module.get(CreateAppointmentUseCase);
    searchUseCase = module.get(SearchAppointmentUseCase);
    updateUseCase = module.get(UpdateAppointmentUseCase);
    deleteUseCase = module.get(DeleteAppointmentUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an appointment', async () => {
      createUseCase.execute.mockResolvedValue(mockAppointment);

      const result = await controller.create({
        patientId: 'patient-id-1',
        doctorId: 'doctor-id-1',
        unitId: 'unit-id-1',
        title: 'Consulta Geral',
        scheduledAt: '2027-06-01T09:00:00.000Z',
        type: AppointmentType.CONSULTATION,
      } as any);

      expect(createUseCase.execute).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findByPatient', () => {
    it('should return appointments by patient', async () => {
      searchUseCase.findByPatientId.mockResolvedValue([mockAppointment]);
      const result = await controller.findByPatient('patient-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findByDoctor', () => {
    it('should return appointments by doctor', async () => {
      searchUseCase.findByDoctorId.mockResolvedValue([mockAppointment]);
      const result = await controller.findByDoctor('doctor-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return appointment by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockAppointment);
      const result = await controller.findOne('appointment-id-1');
      expect(result).toBeDefined();
    });

    it('should propagate AppointmentNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new AppointmentNotFoundException('nonexistent'),
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        AppointmentNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update appointment status', async () => {
      const updated = {
        ...mockAppointment,
        status: AppointmentStatus.CONFIRMED,
      };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.update('appointment-id-1', {
        status: AppointmentStatus.CONFIRMED,
      });
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete appointment', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('appointment-id-1'),
      ).resolves.toBeUndefined();
    });
  });
});
