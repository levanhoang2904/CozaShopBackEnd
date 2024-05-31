/* eslint-disable prettier/prettier */
import {
  Req,
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from '../../dto/cartItem.dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth } from '../../dto/auth.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('my-cart')
  getCart(@Req() request: Request & { user: Auth }) {
    try {
      if ('user' in request) {
        return this.cartService.getCart(request.user._id);
      } else
        return {
          message: 'Vui lòng đăng nhập để thêm sản phẩm',
          status: 401,
        };
    } catch (error) {
      return {
        message: 'Vui lòng đăng nhập lại',
        status: 401,
      };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  addItemCart(
    @Req() request: Request & { user: Auth },
    @Body() cartItem: CartItemDto,
  ) {
    try {
      if ('user' in request) {
        return this.cartService.addToCart(request.user._id, cartItem);
      } else
        return {
          message: 'Vui lòng đăng nhập để thêm sản phẩm',
          status: 401,
        };
    } catch (error) {
      return {
        message: 'Vui lòng đăng nhập lại',
        status: 401,
      };
    }
  }

  @Get(':idCartItem/my-cart')
  updateAmountItemCart(
    @Param('idCartItem') idCartItem: string,
    @Query() query: any,
  ) {
    return this.cartService.updateAmountItemCart(idCartItem, query);
  }

  @Delete(':idCartItem/my-cart')
  deleteCartItem(@Param('idCartItem') idCartItem: string) {
    return this.cartService.deleteItemCart(idCartItem);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('my-cart')
  async deleteCart(@Req() request: Request & { user: Auth }) {
    try {
      if ('user' in request) {
        const myCart = await this.cartService.myCart(request.user._id);
        if (myCart) {
          return this.cartService.deleteCart(myCart._id);
        }

        return {
          message: 'Giỏ hàng của bạn trống!!!',
          status: 401,
        };
      } else
        return {
          message: 'Vui lòng đăng nhập để sử dụng chức năng',
          status: 401,
        };
    } catch (error) {
      return {
        message: 'Vui lòng đăng nhập lại',
        status: 401,
      };
    }
  }
}
