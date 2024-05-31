/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ContentComment } from './contentComment.schema';
import mongoose from 'mongoose';
@Schema({ collection: 'comments' })
export class Comment {

  @Prop({ required: true })
  _idProduct: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentComment' }])
  comments: [];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
