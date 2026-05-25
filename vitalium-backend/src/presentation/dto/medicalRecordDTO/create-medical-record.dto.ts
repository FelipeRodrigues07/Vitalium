import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { RecordType } from '../../../shared/enums/record-type.enum';

export class CreateMedicalRecordDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 'Consulta de rotina' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Paciente apresentou sintomas de gripe' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Gripe influenza' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: ['febre', 'tosse'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @ApiPropertyOptional({ example: 'Repouso e hidratação' })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional({ example: 'Retorno em 7 dias' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ example: '2026-05-25' })
  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @ApiProperty({ enum: RecordType, example: RecordType.CONSULTATION })
  @IsEnum(RecordType)
  recordType: RecordType;
}
