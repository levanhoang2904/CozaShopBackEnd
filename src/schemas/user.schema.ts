/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserAddress } from './userAddress.schema';

@Schema({ collection: 'users', timestamps: true })
export class User {
  constructor(userDto?: Partial<User>) {
    if (userDto) {
      Object.assign(this, userDto);
    }
  }
  _id: any = null;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: false })
  phone: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  date: Date;

  @Prop({ required: false })
  OTP?: string;

  @Prop({ required: false })
  resetExpires?: Date;

  @Prop({ required: false })
  role?: string;

  @Prop({ required: false })
  resetToken?: string;

  @Prop([{ type: mongoose.Schema.Types.String, ref: 'UserAddress' }])
  addresses: UserAddress[];
}

export const UserSchema = SchemaFactory.createForClass(User);
