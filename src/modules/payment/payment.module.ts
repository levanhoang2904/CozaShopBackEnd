/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CartModule } from '../cart/cart.module';
import { CartService } from '../cart/cart.service';
import { Cart, CartSchema } from '../../schemas/cart.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDetail,
  ProductDetailSchema,
} from '../../schemas/productDetail.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import {
  ProductSize,
  ProductSizeSchema,
} from '../../schemas/productSize.schema';
import { CartItem, CartItemSchema } from '../../schemas/cartItem.schema';
import { ProductService } from '../product/product.service';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { OrderService } from '../order/order.service';
import {
  OrderDetail,
  OrderDetailSchema,
} from '../../schemas/orderDetail.schema';
import { HttpModule } from '@nestjs/axios';
import {
  UserAddress,
  UserAddressSchema,
} from '../../schemas/userAddress.schema';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    CartModule,
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: CartItem.name,
        schema: CartItemSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: ProductDetail.name,
        schema: ProductDetailSchema,
      },
      {
        name: ProductSize.name,
        schema: ProductSizeSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
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
        schema: UserAddressSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, CartService, ProductService, OrderService],
})
export class PaymentModule {}
