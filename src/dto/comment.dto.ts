/* eslint-disable prettier/prettier */
import { ContentComment } from '../schemas/contentComment.schema';
export class CommentDto {
  _idProduct: string;

  comment: {
    _idUser: string;
    date: string;
    content: string;
  };
}
