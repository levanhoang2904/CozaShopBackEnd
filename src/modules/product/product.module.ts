/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { Category, CategorySchema } from './../../schemas/category.schema';
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../../schemas/product.schema';
import {
  ProductDetail,
  ProductDetailSchema,
} from '../../schemas/productDetail.schema';
import {
  ProductSize,
  ProductSizeSchema,
} from '../../schemas/productSize.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: ProductDetail.name,
        schema: ProductDetailSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: ProductSize.name,
        schema: ProductSizeSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
