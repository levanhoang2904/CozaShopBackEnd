/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ collection: 'categories' })
export class Category {
  _id: any;

  @Prop({ required: true, unique: true })
  namecategory: string;

  @Prop({ required: false })
  note?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
