import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateNurseDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'SP-123456' })
  @IsString()
  coren: string;

  @ApiProperty({
    example: true,
    description: 'COREN ativo (true) ou suspenso (false)',
  })
  @IsBoolean()
  corenState: boolean;
}
