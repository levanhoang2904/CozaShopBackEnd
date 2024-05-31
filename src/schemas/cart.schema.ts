/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ collection: 'cart' })
export class Cart {
  _id: any;

  @Prop({ type: mongoose.Schema.Types.String, ref: 'User' })
  idUser: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }])
  items: [];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
