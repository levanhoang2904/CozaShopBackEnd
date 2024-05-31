/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Comment } from '../../schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDto } from '../../dto/comment.dto';
import { ContentComment } from '../../schemas/contentComment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(ContentComment.name)
    private contentCommentModel: Model<ContentComment>,
  ) {}

  async postComment(commentDto: CommentDto): Promise<boolean> {
    try {
      const data: any = await this.commentModel.findOne({
        _idProduct: commentDto._idProduct,
      });
      if (data) {
        const contentComment = await this.contentCommentModel.create({
          _idUser: commentDto.comment._idUser,
          content: commentDto.comment.content,
        });

        data.comments.push(contentComment._id);
        data.save();
      } else {
        const contentComment = await this.contentCommentModel.create({
          _idUser: commentDto.comment._idUser,
          content: commentDto.comment.content,
        });
        await this.commentModel.create({
          _idProduct: commentDto._idProduct,
          comments: [contentComment._id],
        });
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getComment(idProduct: string) {
    return await this.commentModel
      .find({ _idProduct: idProduct })
      .populate({ path: 'comments' });
  }

  async removeComment(idProduct: string, idUser: string, createdAt: string) {
    const createdAtDate = new Date(createdAt);

    const contentComment = await this.contentCommentModel.findOne({
      _idUser: idUser,
      createdAt: {
        $gte: createdAtDate,
        $lt: new Date(createdAtDate.getTime() + 1000),
      },
    });
    const data: any = await this.commentModel.findOne({
      _idProduct: idProduct,
    });
    if (data) {
      data.comments.map((comment: any, index: number) => {
        if (contentComment._id.toString() == comment.toString()) {
          data.comments.splice(index, 1);
        }
      });
      data.save();
      await this.contentCommentModel.findByIdAndDelete(contentComment._id);
      return true;
    }
  }
}
