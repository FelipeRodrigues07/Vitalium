import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AppointmentResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() patientId: string;
  @ApiProperty() @Expose() doctorId: string;
  @ApiProperty() @Expose() unitId: string;
  @ApiProperty() @Expose() title: string;
  @ApiPropertyOptional() @Expose() description?: string;
  @ApiProperty() @Expose() scheduledAt: string;
  @ApiProperty() @Expose() duration: number;
  @ApiProperty() @Expose() status: string;
  @ApiProperty() @Expose() type: string;
  @ApiPropertyOptional() @Expose() price?: number;
  @ApiPropertyOptional() @Expose() notes?: string;
  @ApiProperty() @Expose() createdAt: string;
  @ApiProperty() @Expose() updatedAt: string;
}
