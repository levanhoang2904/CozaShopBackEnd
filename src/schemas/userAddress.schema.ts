/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ collection: 'userAddress' })
export class UserAddress {
  _id: any;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  detailAddress?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  district?: string;

  @Prop({ required: false })
  ward?: string;

  @Prop({ required: false })
  note?: string;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
