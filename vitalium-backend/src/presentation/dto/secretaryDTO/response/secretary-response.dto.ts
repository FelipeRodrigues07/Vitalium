import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUnitDTO } from '../../unitDTO/response/unit-response.dto';

export class SecretaryUserDTO {
  @Expose() id: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() email: string;
}

export class SecretaryResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() userId: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => SecretaryUserDTO)
  user?: SecretaryUserDTO;

  @ApiPropertyOptional({ type: () => [ResponseUnitDTO], isArray: true })
  @Expose()
  @Type(() => ResponseUnitDTO)
  units?: ResponseUnitDTO[];
}
