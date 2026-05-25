import type { Patient } from '../../../../infrastructure/database/models/patient.models';
import type { CreatePatientDTO } from '../../../../presentation/dto/patientDTO/create-patient.dto';
import { UpdatePatientDTO } from '../../../../presentation/dto/patientDTO/update-patient.dto';

export interface IPatientRepository {
  create(createPatientDTO: CreatePatientDTO): Promise<Patient>;
  findById(id: string): Promise<Patient | null>;
  findByCpf(cpf: string): Promise<Patient | null>;
  findByUserId(userId: string): Promise<Patient | null>;
  findAll(): Promise<Patient[]>;
  findAllByDoctorId(doctorId: string): Promise<Patient[]>;
  findFirstByPatientId(patientId: string): Promise<Patient | null>;
  findByWhatsappPhone(phone: string): Promise<Patient | null>;
  update(id: string, updatePatientDTO: UpdatePatientDTO): Promise<Patient>;
  delete(id: string): Promise<void>;
  hasActiveUnitLink(patientId: string, unitId: string): Promise<boolean>;
}
