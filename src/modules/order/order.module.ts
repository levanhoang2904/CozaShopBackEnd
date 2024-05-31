/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../../schemas/order.schema';
import {
  OrderDetail,
  OrderDetailSchema,
} from '../../schemas/orderDetail.schema';
import { HttpModule } from '@nestjs/axios';
import { UserAddress, UserAddressSchema } from '../../schemas/userAddress.schema';
import { ProductSize, ProductSizeSchema } from '../../schemas/productSize.schema';

@Module({
  controllers: [OrderController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: OrderDetail.name,
        schema: OrderDetailSchema,
      },
      {
        name: UserAddress.name,
        schema: UserAddressSchema
      },
      {
        name: ProductSize.name,
        schema: ProductSizeSchema
      },
      
    ]),
    HttpModule
  ],
  providers: [OrderService],
})
export class OrderModule {}
