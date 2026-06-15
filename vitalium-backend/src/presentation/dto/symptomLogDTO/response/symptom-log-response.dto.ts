import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SymptomLogResponseDTO {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  patientId: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ required: false })
  @Expose()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @Expose()
  imageFileName?: string;

  @ApiProperty({ required: false })
  @Expose()
  imageMimeType?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
