import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrescriptionResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() patientId: string;
  @ApiProperty() @Expose() doctorId: string;
  @ApiProperty() @Expose() unitId: string;
  @ApiProperty() @Expose() medication: string;
  @ApiProperty() @Expose() dosage: string;
  @ApiProperty() @Expose() frequency: string;
  @ApiProperty() @Expose() duration: string;
  @ApiPropertyOptional() @Expose() instructions?: string;
  @ApiProperty() @Expose() prescribedAt: string;
  @ApiProperty() @Expose() createdAt: string;
}
