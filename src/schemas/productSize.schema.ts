/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ collection: 'productSize' })
export class ProductSize {

  //_id: string

  @Prop({ required: true })
  size: string;

  @Prop({ required: false })
  quantity: number = 0;
}

export const ProductSizeSchema = SchemaFactory.createForClass(ProductSize);
