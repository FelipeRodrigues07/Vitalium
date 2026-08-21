import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SecretaryUnitSecretaryDTO {
  @Expose() id: string;
  @Expose() isActive: boolean;
}

export class SecretaryUnitUnitDTO {
  @Expose() id: string;
  @Expose() name: string;
}

export class SecretaryUnitResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() secretaryId: string;
  @ApiProperty() @Expose() unitId: string;
  @ApiProperty() @Expose() isPrimary: boolean;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => SecretaryUnitSecretaryDTO)
  secretary?: SecretaryUnitSecretaryDTO;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => SecretaryUnitUnitDTO)
  unit?: SecretaryUnitUnitDTO;
}
