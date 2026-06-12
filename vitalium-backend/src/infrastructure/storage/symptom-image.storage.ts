import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { UploadedImageFile } from '../../shared/types/uploaded-file.interface';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface SavedSymptomImage {
  imageUrl: string;
  imageFileName: string;
  imageMimeType: string;
}

@Injectable()
export class SymptomImageStorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'symptom-images');

  async save(
    file: UploadedImageFile,
    patientId: string,
  ): Promise<SavedSymptomImage> {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Formato de imagem não suportado. Use JPEG, PNG ou WebP.',
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Imagem muito grande. Limite de 5 MB.');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const extension = this.resolveExtension(file);
    const storedFileName = `${patientId}-${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = join(this.uploadDir, storedFileName);

    await writeFile(absolutePath, file.buffer);

    return {
      imageUrl: `/uploads/symptom-images/${storedFileName}`,
      imageFileName: file.originalname || storedFileName,
      imageMimeType: file.mimetype,
    };
  }

  private resolveExtension(file: UploadedImageFile): string {
    const fromName = extname(file.originalname).toLowerCase();
    if (fromName) {
      return fromName;
    }

    switch (file.mimetype) {
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return '.jpg';
    }
  }
}
