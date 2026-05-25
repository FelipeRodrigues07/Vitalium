import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateMedicalAttachmentDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  medicalRecordId: string;

  @ApiProperty({ example: 'exame-sangue.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'https://storage.example.com/files/exame-sangue.pdf',
  })
  @IsString()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  fileType: string;

  @ApiProperty({ example: 204800, description: 'Tamanho do arquivo em bytes' })
  @IsInt()
  @Min(1)
  fileSize: number;
}
