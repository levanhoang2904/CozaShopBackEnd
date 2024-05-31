/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CartItem } from './cartItem.schema';
import mongoose from 'mongoose';
import { Product } from './product.schema';
import { ProductDetail } from './productDetail.schema';
import { ProductSize } from './productSize.schema';

@Schema()
export class OrderDetail {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  idProduct: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail' })
  idColor: ProductDetail;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSize' })
  idSize: ProductSize;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  comment: boolean;
}
export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
