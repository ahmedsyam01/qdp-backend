import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = path.join(this.uploadPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    // Return URL (adjust based on your setup)
    return `/uploads/${filename}`;
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      const url = await this.uploadImage(file);
      urls.push(url);
    }

    return urls;
  }

  async deleteImage(filename: string): Promise<void> {
    // Remove '/uploads/' prefix if present
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    const filepath = path.join(this.uploadPath, cleanFilename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    } else {
      throw new NotFoundException('Image not found');
    }
  }

  async deleteMultipleImages(filenames: string[]): Promise<void> {
    for (const filename of filenames) {
      await this.deleteImage(filename);
    }
  }
}
