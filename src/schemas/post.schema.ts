/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date } from 'mongoose';
@Schema({ collection: 'posts' })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.String, ref: 'Category' })
  category: any;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ type: Date, default: Date.now })
  createDate: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
