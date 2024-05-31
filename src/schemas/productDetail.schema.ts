/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Product } from './product.schema';
import { ProductSize } from './productSize.schema';

@Schema({ collection: 'productDetail', timestamps: true })
export class ProductDetail {
  _id: string;

  @Prop({ required: false })
  color: string;

  @Prop({ required: false })
  image: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSize' }])
  sizes: ProductSize[];
}

export const ProductDetailSchema = SchemaFactory.createForClass(ProductDetail);
