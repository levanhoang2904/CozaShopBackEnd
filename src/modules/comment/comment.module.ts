/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../../schemas/comment.schema';
import { ContentComment, ContentCommentSchema } from '../../schemas/contentComment.schema';

@Module({
  controllers: [CommentController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: ContentComment.name,
        schema: ContentCommentSchema,
      },
    ]),
  ],
  providers: [CommentService],
})
export class CommentModule {}
