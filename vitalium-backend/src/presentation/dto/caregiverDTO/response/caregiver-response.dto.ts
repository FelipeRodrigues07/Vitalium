import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaregiverUserDTO {
  @Expose() id: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() email: string;
}

export class CaregiverResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() userId: string;
  @ApiProperty() @Expose() cpf: string;
  @ApiProperty() @Expose() relationship: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => CaregiverUserDTO)
  user?: CaregiverUserDTO;
}
