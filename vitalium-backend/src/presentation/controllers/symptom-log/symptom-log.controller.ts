import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { Request as ExpressRequest } from 'express';
import { memoryStorage } from 'multer';
import { CreateSymptomLogUseCase } from '../../../application/use-cases/symptom-log/create-symptom-log.use-case';
import { GenerateSymptomMonthlyReportUseCase } from '../../../application/use-cases/symptom-log/generate-symptom-monthly-report.use-case';
import { ListSymptomLogsUseCase } from '../../../application/use-cases/symptom-log/list-symptom-logs.use-case';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import type { UploadedImageFile } from '../../../shared/types/uploaded-file.interface';
import { CreateSymptomLogDTO } from '../../dto/symptomLogDTO/create-symptom-log.dto';
import { SymptomLogResponseDTO } from '../../dto/symptomLogDTO/response/symptom-log-response.dto';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('symptom-logs')
@ApiBearerAuth('JWT-auth')
@Controller('symptom-logs')
@UseGuards(AuthGuard, RolesGuard)
export class SymptomLogController {
  constructor(
    private readonly createSymptomLogUseCase: CreateSymptomLogUseCase,
    private readonly listSymptomLogsUseCase: ListSymptomLogsUseCase,
    private readonly generateSymptomMonthlyReportUseCase: GenerateSymptomMonthlyReportUseCase,
    private readonly clinicMembershipService: ClinicMembershipService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.PATIENT)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Registrar sintoma (paciente)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: SymptomLogResponseDTO })
  async create(
    @Body() dto: CreateSymptomLogDTO,
    @UploadedFile() image: UploadedImageFile | undefined,
    @Request() req: RequestWithUser,
  ): Promise<SymptomLogResponseDTO> {
    const log = await this.createSymptomLogUseCase.execute(
      dto,
      req.user,
      image,
    );

    return plainToInstance(SymptomLogResponseDTO, log, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Listar sintomas do paciente autenticado' })
  @ApiResponse({ status: 200, type: [SymptomLogResponseDTO] })
  async list(
    @Request() req: RequestWithUser,
  ): Promise<SymptomLogResponseDTO[]> {
    const logs = await this.listSymptomLogsUseCase.executeForAuthUser(req.user);

    return plainToInstance(SymptomLogResponseDTO, logs, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Listar sintomas de um paciente (médico)' })
  @ApiResponse({ status: 200, type: [SymptomLogResponseDTO] })
  async listByPatient(
    @Param('patientId') patientId: string,
    @Query('unitId') unitId: string | undefined,
    @Request() req: RequestWithUser,
  ): Promise<SymptomLogResponseDTO[]> {
    const scopedUnitId = await this.clinicMembershipService.resolveDoctorListUnitId(
      req.user,
      unitId,
    );
    const logs = await this.listSymptomLogsUseCase.executeForDoctor(
      patientId,
      req.user,
      scopedUnitId,
    );

    return plainToInstance(SymptomLogResponseDTO, logs, {
      excludeExtraneousValues: true,
    });
  }

  @Post('patient/:patientId/monthly-report')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Gerar relatório mensal de sintomas do paciente (IA)',
  })
  async monthlyReport(
    @Param('patientId') patientId: string,
    @Query('month') month: string | undefined,
    @Query('unitId') unitId: string | undefined,
    @Request() req: RequestWithUser,
  ) {
    const resolvedMonth =
      month && month.trim().length > 0
        ? month.trim()
        : new Date().toISOString().slice(0, 7);

    const scopedUnitId = await this.clinicMembershipService.resolveDoctorListUnitId(
      req.user,
      unitId,
    );

    return this.generateSymptomMonthlyReportUseCase.execute(
      patientId,
      resolvedMonth,
      req.user,
      scopedUnitId,
    );
  }
}
