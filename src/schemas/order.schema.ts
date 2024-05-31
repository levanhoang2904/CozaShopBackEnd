/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderDetail } from './orderDetail.schema';

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: false })
  _idUser: string;
  @Prop({ required: true })
  status: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId , ref: 'UserAddress', required: false })
  _idAddress: any;
  @Prop({ required: true })
  totalPrice: number;
  @Prop({ required: false })
  idOrderVNPost: string;
  @Prop({ required: false })
  _idOrderDetail: OrderDetail[];
  @Prop({type: Date })
  createdAt:Date;
  @Prop({ required: false })
  nameStaff: string;
  
}

export const OrderSchema = SchemaFactory.createForClass(Order);
