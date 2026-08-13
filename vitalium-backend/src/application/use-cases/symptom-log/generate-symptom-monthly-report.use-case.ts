import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IPatientDoctorRepository } from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { ISymptomLogRepository } from '../../../domain/interfaces/repositories/symptom-log/symptom-log.repository.interface';
import type { Patient } from '../../../infrastructure/database/models/patient.models';
import type { SymptomLog } from '../../../infrastructure/database/models/symptom-log.models';
import { isSuperAdmin } from '../../../shared/auth/auth-scope.helper';
import { Role } from '../../../shared/enums';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

export interface SymptomMonthlyReportResult {
  patientId: string;
  patientName: string;
  month: string;
  summary: string;
  source: string;
  symptomCount: number;
}

@Injectable()
export class GenerateSymptomMonthlyReportUseCase {
  private readonly logger = new Logger(GenerateSymptomMonthlyReportUseCase.name);

  constructor(
    @Inject('ISymptomLogRepository')
    private readonly symptomLogRepository: ISymptomLogRepository,
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
    @Inject('IPatientDoctorRepository')
    private readonly patientDoctorRepository: IPatientDoctorRepository,
  ) {}

  async execute(
    patientId: string,
    month: string,
    authUser: AuthJwtPayload,
  ): Promise<SymptomMonthlyReportResult> {
    await this.assertDoctorAccess(patientId, authUser);

    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Mês inválido. Use o formato YYYY-MM');
    }

    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const patientName = this.resolvePatientName(patient);
    const logs = await this.symptomLogRepository.findByPatientId(patientId);
    const monthLogs = logs.filter((log) => this.isInMonth(log.createdAt, month));

    const fromAi = await this.tryGenerateWithAi(
      patientId,
      patientName,
      month,
      monthLogs,
    );

    if (fromAi) {
      return fromAi;
    }

    return {
      patientId,
      patientName,
      month,
      summary: this.buildLocalSummary(patientName, month, monthLogs),
      source: 'local',
      symptomCount: monthLogs.length,
    };
  }

  private async tryGenerateWithAi(
    patientId: string,
    patientName: string,
    month: string,
    monthLogs: SymptomLog[],
  ): Promise<SymptomMonthlyReportResult | null> {
    const candidates = [
      process.env.AI_SERVICE_URL,
      'http://vitalium-ai:3003',
      'http://localhost:3003',
    ]
      .filter((value): value is string => Boolean(value && value.trim()))
      .map((value) => value.replace(/\/$/, ''));

    const uniqueCandidates = [...new Set(candidates)];
    const payload = {
      patientId,
      patientName,
      month,
      symptoms: monthLogs.map((log) => ({
        description: log.description,
        createdAt:
          log.createdAt instanceof Date
            ? log.createdAt.toISOString()
            : String(log.createdAt),
      })),
    };

    for (const aiBaseUrl of uniqueCandidates) {
      try {
        const response = await fetch(`${aiBaseUrl}/reports/symptoms-monthly`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          this.logger.warn(
            `IA em ${aiBaseUrl} respondeu ${response.status}; tentando próximo`,
          );
          continue;
        }

        const data = (await response.json()) as {
          summary: string;
          source: string;
          symptomCount: number;
        };

        return {
          patientId,
          patientName,
          month,
          summary: data.summary,
          source: data.source,
          symptomCount: data.symptomCount,
        };
      } catch (error) {
        this.logger.warn(
          `Falha ao chamar IA em ${aiBaseUrl}: ${
            error instanceof Error ? error.message : 'erro desconhecido'
          }`,
        );
      }
    }

    return null;
  }

  private buildLocalSummary(
    patientName: string,
    month: string,
    monthLogs: SymptomLog[],
  ): string {
    if (monthLogs.length === 0) {
      return `Não há relatos de sintomas de ${patientName} no período ${month}.`;
    }

    const counts = new Map<string, number>();
    for (const log of monthLogs) {
      const key = log.description.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => `- ${text} (${count}x)`)
      .join('\n');

    const recent = monthLogs
      .slice(0, 3)
      .map((log) => `- ${log.description.trim()}`)
      .join('\n');

    return [
      '## Resumo',
      `No período ${month}, ${patientName} registrou ${monthLogs.length} relato(s) de sintomas.`,
      '',
      '## Principais queixas',
      top || '- Sem descrições válidas',
      '',
      '## Relatos recentes',
      recent || '- Nenhum',
      '',
      '## Pontos de atenção',
      '- Revisar evolução clínica com base nos relatos acima.',
    ].join('\n');
  }

  private isInMonth(createdAt: Date | string, month: string): boolean {
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return false;

    // Usa fuso de Brasília (UTC-3) para bater com o mês escolhido no painel.
    const br = new Date(created.getTime() - 3 * 60 * 60 * 1000);
    const key = `${br.getUTCFullYear()}-${String(br.getUTCMonth() + 1).padStart(2, '0')}`;
    return key === month;
  }

  private async assertDoctorAccess(
    patientId: string,
    authUser: AuthJwtPayload,
  ): Promise<void> {
    if (isSuperAdmin(authUser) || authUser.role === Role.ADMIN) {
      return;
    }

    if (authUser.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Apenas médicos podem gerar relatório de sintomas',
      );
    }

    const doctor = await this.doctorRepository.findByUserId(authUser.sub);
    if (!doctor) {
      throw new ForbiddenException('Perfil de médico não encontrado');
    }

    const link = await this.patientDoctorRepository.findByPatientAndDoctor(
      patientId,
      doctor.id,
    );

    if (!link || link.endDate) {
      throw new ForbiddenException(
        'Você só pode gerar relatório de pacientes vinculados a você',
      );
    }
  }

  private resolvePatientName(patient: Patient): string {
    const source = patient.user;
    if (!source) return 'Paciente';
    const full = `${source.firstName ?? ''} ${source.lastName ?? ''}`.trim();
    return full || 'Paciente';
  }
}
