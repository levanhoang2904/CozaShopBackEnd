/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CateogryModule } from './modules/cateogry/category.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CartModule } from './modules/cart/cart.module';
import { ChatGateway } from './app/chat/chat.gateway';
import { CommentModule } from './modules/comment/comment.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OrderModule } from './modules/order/order.module';
import { PostModule } from './modules/post/post.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'public'),
    }),
    
    MongooseModule.forRoot('mongodb+srv://levanhoang29042002:0987654321Hoang@store.92uq7c6.mongodb.net/Store'),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SCERET,
    }),
    AuthModule,
    ProductModule,
    CateogryModule,
    CommentModule,
    CartModule,
    PaymentModule,
    OrderModule,
    PostModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
