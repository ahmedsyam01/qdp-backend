import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.uploadService.uploadMultipleImages(files);
    return { urls };
  }

  @Delete('image/:filename')
  async deleteImage(@Param('filename') filename: string) {
    await this.uploadService.deleteImage(filename);
    return { message: 'Image deleted successfully' };
  }
}
