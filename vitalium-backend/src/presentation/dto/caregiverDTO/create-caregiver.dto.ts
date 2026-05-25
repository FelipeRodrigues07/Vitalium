import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches } from 'class-validator';
import { CaregiverRelationship } from '../../../shared/enums/caregiver-relationship.enum';

export class CreateCaregiverDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos' })
  cpf: string;

  @ApiProperty({
    enum: CaregiverRelationship,
    example: CaregiverRelationship.PARENT,
  })
  @IsEnum(CaregiverRelationship)
  relationship: CaregiverRelationship;
}
