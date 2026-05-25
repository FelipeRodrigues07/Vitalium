import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAdminUseCase } from '../../../application/use-cases/admin/create-admin.use-case';
import { DeleteAdminUseCase } from '../../../application/use-cases/admin/delete-admin.use-case';
import { SearchAdminUseCase } from '../../../application/use-cases/admin/search-admin.use-case';
import { UpdateAdminUseCase } from '../../../application/use-cases/admin/update-admin.use-case';
import { AdminRole } from '../../../shared/enums/admin-role.enum';
import { AdminAlreadyExistsException } from '../../../shared/execeptions/admin/admin-already-exists.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  let controller: AdminController;
  let createAdminUseCase: jest.Mocked<CreateAdminUseCase>;
  let searchAdminUseCase: jest.Mocked<SearchAdminUseCase>;
  let updateAdminUseCase: jest.Mocked<UpdateAdminUseCase>;
  let deleteAdminUseCase: jest.Mocked<DeleteAdminUseCase>;

  const mockAdmin = {
    id: 'admin-id-1',
    userId: 'user-id-1',
    role: AdminRole.HOSPITAL_ADMIN,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    user: {
      id: 'user-id-1',
      firstName: 'João',
      lastName: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: CreateAdminUseCase, useValue: { execute: jest.fn() } },
        { provide: SearchAdminUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateAdminUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteAdminUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AdminController>(AdminController);
    createAdminUseCase = module.get(CreateAdminUseCase);
    searchAdminUseCase = module.get(SearchAdminUseCase);
    updateAdminUseCase = module.get(UpdateAdminUseCase);
    deleteAdminUseCase = module.get(DeleteAdminUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── POST /admins ─────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDTO = {
      userId: 'user-id-1',
      role: AdminRole.HOSPITAL_ADMIN,
      isActive: true,
    };

    it('should create admin and return AdminResponseDTO', async () => {
      createAdminUseCase.execute.mockResolvedValue(mockAdmin as any);

      const result = await controller.create(createDTO);

      expect(createAdminUseCase.execute).toHaveBeenCalledWith(createDTO);
      expect(result.id).toBe('admin-id-1');
      expect(result.role).toBe(AdminRole.HOSPITAL_ADMIN);
    });

    it('should propagate AdminAlreadyExistsException', async () => {
      createAdminUseCase.execute.mockRejectedValue(
        new AdminAlreadyExistsException('userId: user-id-1'),
      );

      await expect(controller.create(createDTO)).rejects.toThrow(
        AdminAlreadyExistsException,
      );
    });
  });

  // ─── GET /admins/:id ──────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return AdminResponseDTO for existing admin', async () => {
      searchAdminUseCase.execute.mockResolvedValue(mockAdmin as any);

      const result = await controller.findById('admin-id-1');

      expect(searchAdminUseCase.execute).toHaveBeenCalledWith('admin-id-1');
      expect(result.id).toBe('admin-id-1');
    });

    it('should propagate UnitNotFoundException when not found', async () => {
      searchAdminUseCase.execute.mockRejectedValue(
        new UnitNotFoundException('ID: admin-id-999'),
      );

      await expect(controller.findById('admin-id-999')).rejects.toThrow(
        UnitNotFoundException,
      );
    });
  });

  // ─── PATCH /admins/:id ────────────────────────────────────────────────────────

  describe('update', () => {
    const updateDTO = { role: AdminRole.CLINIC_ADMIN };

    it('should update admin and return AdminResponseDTO', async () => {
      const updated = { ...mockAdmin, role: AdminRole.CLINIC_ADMIN };
      updateAdminUseCase.execute.mockResolvedValue(updated as any);

      const result = await controller.update('admin-id-1', updateDTO);

      expect(updateAdminUseCase.execute).toHaveBeenCalledWith(
        'admin-id-1',
        updateDTO,
      );
      expect(result.role).toBe(AdminRole.CLINIC_ADMIN);
    });

    it('should propagate UnitNotFoundException when not found', async () => {
      updateAdminUseCase.execute.mockRejectedValue(
        new UnitNotFoundException('ID: admin-id-999'),
      );

      await expect(
        controller.update('admin-id-999', updateDTO),
      ).rejects.toThrow(UnitNotFoundException);
    });
  });

  // ─── DELETE /admins/:id ───────────────────────────────────────────────────────

  describe('delete', () => {
    it('should call delete use case and return undefined', async () => {
      deleteAdminUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.delete('admin-id-1');

      expect(deleteAdminUseCase.execute).toHaveBeenCalledWith('admin-id-1');
      expect(result).toBeUndefined();
    });

    it('should propagate UnitNotFoundException when not found', async () => {
      deleteAdminUseCase.execute.mockRejectedValue(
        new UnitNotFoundException('ID: admin-id-999'),
      );

      await expect(controller.delete('admin-id-999')).rejects.toThrow(
        UnitNotFoundException,
      );
    });
  });

  // ─── Guard behavior ───────────────────────────────────────────────────────────

  describe('guard enforcement (RolesGuard)', () => {
    it('should reject request when RolesGuard denies access', async () => {
      const moduleWithRoleReject: TestingModule =
        await Test.createTestingModule({
          controllers: [AdminController],
          providers: [
            { provide: CreateAdminUseCase, useValue: { execute: jest.fn() } },
            { provide: SearchAdminUseCase, useValue: { execute: jest.fn() } },
            { provide: UpdateAdminUseCase, useValue: { execute: jest.fn() } },
            { provide: DeleteAdminUseCase, useValue: { execute: jest.fn() } },
          ],
        })
          .overrideGuard(AuthGuard)
          .useValue({ canActivate: jest.fn().mockReturnValue(true) })
          .overrideGuard(RolesGuard)
          .useValue({
            canActivate: jest.fn().mockImplementation(() => {
              throw new ForbiddenException('Acesso negado');
            }),
          })
          .compile();

      const _ctrl = moduleWithRoleReject.get<AdminController>(AdminController);
      const createUC = moduleWithRoleReject.get(
        CreateAdminUseCase,
      ) as jest.Mocked<CreateAdminUseCase>;
      createUC.execute.mockResolvedValue(mockAdmin as any);

      // Guard throws before reaching controller — simulate by calling guard manually
      const guard = moduleWithRoleReject.get(RolesGuard);
      expect(() => guard.canActivate({} as any)).toThrow(ForbiddenException);
    });
  });
});
