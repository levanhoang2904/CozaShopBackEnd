/* eslint-disable prettier/prettier */
import {
  Query,
  HttpException,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

import { storageConfig } from 'helpers/config';
import { PostService } from './post.service';
import { HttpStatus } from '../../global/globalEnum';
import { CreatePostDTO, UpdatePostDTO } from '../../dto/post.dto';

@Controller('blog')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 500 * 1024) {
            req.fileValidationError =
              'Kích  thước file quá lớn. Kích thước cho phép của file là dưới 500kb.';
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  create(
    @Req() req: any,
    @Body() postDTO: CreatePostDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new HttpException(req.fileValidationError, HttpStatus.ERROR);
    }

    if (!file) {
      throw new BadRequestException('Vui lòng chọn thumbnail cho bài viết!!!');
    }

    postDTO.title = postDTO.title.replace(/\s{2,}/g, ' ');

    return this.postService.create({ ...postDTO, thumbnail: file.filename });
  }

  @Get()
  getAll(@Query() query: any) {
    return this.postService.getAll(query);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.postService.getDetail(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 500 * 1024) {
            req.fileValidationError =
              'Kích  thước file quá lớn. Kích thước cho phép của file là dưới 500kb.';
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() postDTO: UpdatePostDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new HttpException(req.fileValidationError, HttpStatus.ERROR);
    }

    if (file) {
      postDTO.thumbnail = file.filename;
    }

    postDTO.createDate = new Date();
    if (postDTO.title) {
      postDTO.title = postDTO.title.replace(/\s{2,}/g, ' ');
    }

    return this.postService.update(id, postDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.postService.delete(id);
  }

  @Post('cke-upload')
  @UseInterceptors(
    FileInterceptor('upload', {
      storage: storageConfig('ckeditor'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  ckeUpload(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return {
      url: `ckeditor/${file.filename}`,
    };
  }
}
