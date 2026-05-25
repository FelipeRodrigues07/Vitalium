import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MedicalAttachmentResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() medicalRecordId: string;
  @ApiProperty() @Expose() fileName: string;
  @ApiProperty() @Expose() fileUrl: string;
  @ApiProperty() @Expose() fileType: string;
  @ApiProperty() @Expose() fileSize: number;
  @ApiProperty() @Expose() uploadedAt: string;
}
