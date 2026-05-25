import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DoctorResponseDTO } from '../../doctorDTO/response/doctor-response.dto';
import { SpecializationResponseDTO } from '../../specializationDTO/response/specialization-response.dto';

export class DoctorSpecializationResponseDTO {
  @ApiProperty({
    description: 'ID único do vínculo médico-especialização',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID do médico',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  doctorId: string;

  @ApiProperty({
    description: 'ID da especialização',
    example: 'clxyz987654321zyxlc',
  })
  @Expose()
  specializationId: string;

  @ApiProperty({
    description: 'Data de criação do vínculo',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: string;

  // Relacionamentos
  @ApiProperty({
    description: 'Dados da especialização',
    type: () => SpecializationResponseDTO,
  })
  @Expose()
  @Type(() => SpecializationResponseDTO)
  specialization?: SpecializationResponseDTO;

  @ApiProperty({
    description: 'Dados do médico',
    type: () => DoctorResponseDTO,
  })
  @Expose()
  @Type(() => DoctorResponseDTO)
  doctor?: DoctorResponseDTO;
}
