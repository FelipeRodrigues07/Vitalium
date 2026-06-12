import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSymptomLogDTO {
  @ApiProperty({
    example: 'Dor de cabeça forte desde a manhã, piora ao movimentar o pescoço.',
  })
  @IsString()
  @MinLength(3, { message: 'Descreva o sintoma com pelo menos 3 caracteres' })
  @MaxLength(2000, { message: 'Descrição muito longa (máximo 2000 caracteres)' })
  description: string;
}
