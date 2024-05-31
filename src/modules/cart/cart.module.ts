/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from '../../schemas/cart.schema';
import { CartItem, CartItemSchema } from '../../schemas/cartItem.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import {
  ProductDetail,
  ProductDetailSchema,
} from '../../schemas/productDetail.schema';
import {
  ProductSize,
  ProductSizeSchema,
} from '../../schemas/productSize.schema';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
