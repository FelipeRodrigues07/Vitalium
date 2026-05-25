import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WardAdmissionResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() patientId: string;
  @ApiProperty() @Expose() wardId: string;
  @ApiProperty() @Expose() admissionDate: string;
  @ApiPropertyOptional() @Expose() dischargeDate?: string;
  @ApiProperty() @Expose() reason: string;
  @ApiProperty() @Expose() status: string;
  @ApiPropertyOptional() @Expose() notes?: string;
  @ApiProperty() @Expose() createdAt: string;
}
