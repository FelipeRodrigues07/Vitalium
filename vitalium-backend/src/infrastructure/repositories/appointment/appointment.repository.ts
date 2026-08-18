import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import type { CreateAppointmentDTO } from '../../../presentation/dto/appointmentDTO/create-appointment.dto';
import type { UpdateAppointmentDTO } from '../../../presentation/dto/appointmentDTO/update-appointment.dto';
import { Appointment } from '../../database/models/appointment.models';
import { PrismaProvider } from '../../database/prisma.provider';

const includeRelations = {
  patient: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  doctor: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  unit: { select: { id: true, name: true, type: true, city: true } },
};

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateAppointmentDTO): Promise<Appointment> {
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        unitId: dto.unitId,
        title: dto.title,
        description: dto.description ?? null,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration ?? 30,
        status: dto.status ?? 'SCHEDULED',
        type: dto.type,
        price: dto.price ?? null,
        notes: dto.notes ?? null,
      },
      include: includeRelations,
    });
    return plainToInstance(Appointment, appointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: includeRelations,
    });
    return appointment ? plainToInstance(Appointment, appointment) : null;
  }

  async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { patientId, ...(unitId ? { unitId } : {}) },
      include: includeRelations,
      orderBy: { scheduledAt: 'desc' },
    });
    return plainToInstance(Appointment, appointments);
  }

  async findByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { doctorId, ...(unitId ? { unitId } : {}) },
      include: includeRelations,
      orderBy: { scheduledAt: 'desc' },
    });
    return plainToInstance(Appointment, appointments);
  }

  async findByUnitId(unitId: string): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { unitId },
      include: includeRelations,
      orderBy: { scheduledAt: 'desc' },
    });
    return plainToInstance(Appointment, appointments);
  }

  async update(id: string, dto: UpdateAppointmentDTO): Promise<Appointment> {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.scheduledAt !== undefined && {
          scheduledAt: new Date(dto.scheduledAt),
        }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: includeRelations,
    });
    return plainToInstance(Appointment, appointment);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({ where: { id } });
  }
}
