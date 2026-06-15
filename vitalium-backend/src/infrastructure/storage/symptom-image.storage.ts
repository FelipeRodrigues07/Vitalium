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
    const mimetype = this.resolveMimeType(file);

    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      throw new BadRequestException(
        'Formato de imagem não suportado. Use JPEG, PNG ou WebP.',
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Imagem muito grande. Limite de 5 MB.');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const extension = this.resolveExtension(file, mimetype);
    const storedFileName = `${patientId}-${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = join(this.uploadDir, storedFileName);

    await writeFile(absolutePath, file.buffer);

    return {
      imageUrl: `/uploads/symptom-images/${storedFileName}`,
      imageFileName: file.originalname || storedFileName,
      imageMimeType: mimetype,
    };
  }

  private resolveMimeType(file: UploadedImageFile): string {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return file.mimetype;
    }

    const fromName = file.originalname.toLowerCase();
    if (fromName.endsWith('.png')) return 'image/png';
    if (fromName.endsWith('.jpg') || fromName.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    if (fromName.endsWith('.webp')) return 'image/webp';
    if (fromName.endsWith('.heic')) return 'image/heic';
    if (fromName.endsWith('.heif')) return 'image/heif';

    const buffer = file.buffer;
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return 'image/png';
    }

    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      return 'image/jpeg';
    }

    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return 'image/webp';
    }

    return file.mimetype;
  }

  private resolveExtension(
    file: UploadedImageFile,
    mimetype: string,
  ): string {
    const fromName = extname(file.originalname).toLowerCase();
    if (fromName) {
      return fromName;
    }

    switch (mimetype) {
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return '.jpg';
    }
  }
}
