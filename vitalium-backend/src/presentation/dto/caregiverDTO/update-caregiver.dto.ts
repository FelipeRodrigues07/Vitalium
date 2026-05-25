import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { CaregiverRelationship } from '../../../shared/enums/caregiver-relationship.enum';

export class UpdateCaregiverDTO {
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos' })
  cpf?: string;

  @IsOptional()
  @IsEnum(CaregiverRelationship)
  relationship?: CaregiverRelationship;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
