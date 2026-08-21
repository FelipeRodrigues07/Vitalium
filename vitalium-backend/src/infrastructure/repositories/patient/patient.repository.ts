import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { CreatePatientDTO } from '../../../presentation/dto/patientDTO/create-patient.dto';
import type { UpdatePatientDTO } from '../../../presentation/dto/patientDTO/update-patient.dto';
import { Patient } from '../../database/models/patient.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class PatientRepository implements IPatientRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(createPatientDTO: CreatePatientDTO): Promise<Patient> {
    const patient = await this.prisma.patient.create({
      data: {
        userId: createPatientDTO.userId,
        cpf: createPatientDTO.cpf,
        rg: createPatientDTO.rg ?? null,
        birthDate: new Date(createPatientDTO.birthDate),
        gender: createPatientDTO.gender,
        bloodType: createPatientDTO.bloodType ?? null,
        allergies: createPatientDTO.allergies ?? null,
        emergencyContact: createPatientDTO.emergencyContact ?? null,
        emergencyPhone: createPatientDTO.emergencyPhone ?? null,
        address: createPatientDTO.address ?? null,
        city: createPatientDTO.city ?? null,
        state: createPatientDTO.state ?? null,
        zipCode: createPatientDTO.zipCode ?? null,
        whatsappPhone: createPatientDTO.whatsappPhone ?? null,
        isActive: true,
        ...(createPatientDTO.unitId
          ? {
              units: {
                create: {
                  unitId: createPatientDTO.unitId,
                  isPrimary: createPatientDTO.isPrimary ?? true,
                  isActive: true,
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
      },
    });

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units?.map((pu) => pu.unit) ?? [],
    });
  }

  async findById(id: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findFirst({
      where: { id, isActive: true },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (!patient) return null;

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units.map((pu) => pu.unit),
    });
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findFirst({
      where: { cpf },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (!patient) return null;

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units.map((pu) => pu.unit),
    });
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findFirst({
      where: { userId },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          where: { endDate: null },
          include: {
            doctor: { include: { user: true } },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!patient) return null;

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units.map((pu) => pu.unit),
    });
  }

  async findAll(): Promise<Patient[]> {
    const patients = await this.prisma.patient.findMany({
      where: { isActive: true },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    return patients.map((p) =>
      plainToInstance(Patient, {
        ...p,
        units: p.units.map((pu) => pu.unit),
      }),
    );
  }

  async findAllByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<Patient[]> {
    const patients = await this.prisma.patient.findMany({
      where: {
        isActive: true,
        patientDoctors: {
          some: {
            doctorId,
            endDate: null,
          },
        },
        ...(unitId
          ? {
              units: {
                some: {
                  unitId,
                  isActive: true,
                },
              },
            }
          : {}),
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          where: { doctorId, endDate: null },
          include: {
            doctor: { include: { user: true } },
          },
          orderBy: { startDate: 'desc' },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    return patients.map((p) =>
      plainToInstance(Patient, {
        ...p,
        units: p.units.map((pu) => pu.unit),
      }),
    );
  }

  async findAllByUnitId(unitId: string): Promise<Patient[]> {
    const patients = await this.prisma.patient.findMany({
      where: {
        isActive: true,
        units: {
          some: {
            unitId,
            isActive: true,
          },
        },
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    return patients.map((p) =>
      plainToInstance(Patient, {
        ...p,
        units: p.units.map((pu) => pu.unit),
      }),
    );
  }

  async findFirstByPatientId(patientId: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, isActive: true },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!patient) return null;

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units.map((pu) => pu.unit),
    });
  }

  async findByWhatsappPhone(phone: string): Promise<Patient | null> {
    // Aceita número com ou sem '+' (ex: "5511999999999" ou "+5511999999999")
    const normalized = phone.startsWith('+') ? phone : `+${phone}`;

    const patient = await this.prisma.patient.findFirst({
      where: {
        OR: [{ whatsappPhone: phone }, { whatsappPhone: normalized }],
        isActive: true,
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!patient) return null;

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units.map((pu) => pu.unit),
    });
  }

  async update(
    id: string,
    updatePatientDTO: UpdatePatientDTO,
  ): Promise<Patient> {
    const existing = await this.prisma.patient.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new Error(`Patient with id ${id} not found`);
    }

    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        cpf: updatePatientDTO.cpf,
        rg: updatePatientDTO.rg,
        birthDate: updatePatientDTO.birthDate
          ? new Date(updatePatientDTO.birthDate)
          : undefined,
        gender: updatePatientDTO.gender,
        bloodType: updatePatientDTO.bloodType,
        allergies: updatePatientDTO.allergies,
        emergencyContact: updatePatientDTO.emergencyContact,
        emergencyPhone: updatePatientDTO.emergencyPhone,
        address: updatePatientDTO.address,
        city: updatePatientDTO.city,
        state: updatePatientDTO.state,
        zipCode: updatePatientDTO.zipCode,
        whatsappPhone: updatePatientDTO.whatsappPhone,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        units: {
          where: { isActive: true },
          include: { unit: true },
        },
        patientDoctors: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
    });

    return plainToInstance(Patient, {
      ...patient,
      units: patient.units.map((pu) => pu.unit),
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.patient.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new Error(`Patient with id ${id} not found`);
    }

    await this.prisma.patient.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
  }

  async hasActiveUnitLink(patientId: string, unitId: string): Promise<boolean> {
    const link = await this.prisma.patientUnit.findFirst({
      where: {
        patientId,
        unitId,
        isActive: true,
      },
    });

    return !!link;
  }

  async findPrimaryActiveUnitId(patientId: string): Promise<string | null> {
    const link = await this.prisma.patientUnit.findFirst({
      where: {
        patientId,
        isActive: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: { unitId: true },
    });

    return link?.unitId ?? null;
  }
}
