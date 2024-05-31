/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Product } from './product.schema';
import { ProductDetail } from './productDetail.schema';
import { Cart } from './cart.schema';

@Schema({ collection: 'cartItem' })
export class CartItem {
  _id: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  idProduct: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail' })
  idColor: ProductDetail;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSize' })
  idSize: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' })
  idCart: Cart;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
