/* eslint-disable prettier/prettier */
import { ProductDetail } from '../schemas/productDetail.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date } from 'mongoose';
@Schema({ collection: 'products' })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.String, ref: 'Category' })
  categoryId: any;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  sale?: number;

  @Prop({ required: false })
  quantitySold?: number;

  @Prop({ required: true })
  fabric: string;

  @Prop({ required: true })
  path: string;

  @Prop({ type: Date, default: Date.now() })
  createDate: Date;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail' }])
  details: ProductDetail[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
