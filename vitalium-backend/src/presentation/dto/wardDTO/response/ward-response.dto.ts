import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WardResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() unitId: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() type: string;
  @ApiProperty() @Expose() capacity: number;
  @ApiProperty() @Expose() currentLoad: number;
  @ApiPropertyOptional() @Expose() floor?: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: string;
}
