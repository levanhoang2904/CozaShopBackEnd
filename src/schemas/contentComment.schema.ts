/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'contentComment', timestamps: true })
export class ContentComment {
  @Prop({ required: true })
  _idUser: string;
  @Prop({ required: true })
  content: string;
}

export const ContentCommentSchema =
  SchemaFactory.createForClass(ContentComment);
