import { Body } from '@nestjs/common';
/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from '../../dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @Post()
  postComment(@Body() commentDto: CommentDto) {
    try {
      return this.commentService.postComment(commentDto);
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':idProduct')
  getComment(@Param('idProduct') idProduct: string) {
    return this.commentService.getComment(idProduct);
  }

  @Get('/remove/:idProduct/:idUser/:createdAt')
  removeComment(
    @Param('idProduct') idProduct: string,
    @Param('idUser') idUser: string,
    @Param('createdAt') createdAt: string,
  ) {
    return this.commentService.removeComment(idProduct, idUser, createdAt);
  }
}
