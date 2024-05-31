/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from '../../schemas/cart.schema';
import { CartItem } from '../../schemas/cartItem.schema';
import { CartItemDto } from '../../dto/cartItem.dto';
import { HttpStatus } from '../../global/globalEnum';
import { Query } from 'express-serve-static-core';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
  ) {}
  async getCartById(idCart: string): Promise<any> {
    return await this.cartModel.findById(idCart).populate({
      path: 'items',
      populate: [
        {
          path: 'idProduct',
          select: 'name price sale',
        },
        {
          path: 'idColor',
          select: 'color image',
        },
        {
          path: 'idSize',
          select: 'size',
        },
      ],
    });
  }
  async getCart(userId: string): Promise<any> {
    try {
      const cart = await this.cartModel.findOne({ idUser: userId }).populate({
        path: 'items',
        populate: [
          {
            path: 'idProduct',
            select: 'name price sale',
          },
          {
            path: 'idColor',
            select: 'color image',
          },
          {
            path: 'idSize',
            select: 'size',
          },
        ],
      });

      return {
        status: HttpStatus.SUCCESS,
        data: cart,
      };
    } catch (error) {
      return {
        status: HttpStatus.ERROR,
        message: 'Vui lòng thử lại sau!!!',
      };
    }
  }

  async addToCart(userId: string, newItem: CartItemDto): Promise<any> {
    try {
      let cart = await this.cartModel
        .findOne({ idUser: userId })
        .populate({ path: 'items' });

      if (!cart) {
        cart = await this.cartModel.create({
          idUser: userId,
          items: [],
        });
      }

      const matchedItem = await this.cartItemModel.findOne({
        idCart: cart._id,
        idProduct: newItem.idProduct,
        idColor: newItem.idColor,
        idSize: newItem.idSize,
      });

      if (matchedItem) {
        matchedItem.amount += newItem.amount;
        await matchedItem.save();
      } else {
        const cartItem = await this.cartItemModel.create({
          ...newItem,
          idCart: cart._id,
        });

        (cart as any).items.push(cartItem._id);
        await cart.save();
      }

      return {
        status: HttpStatus.SUCCESS,
        message: 'Đã thêm sản phẩm vào giỏ hàng!!!',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Vui lòng thử lại sau!!!',
      };
    }
  }

  async myCart(idUser: string): Promise<any> {
    try {
      return await this.cartModel.findOne({ idUser: idUser });
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Vui lòng đăng nhập để sử dụng chức năng!!!',
      };
    }
  }

  async updateAmountItemCart(idCartItem: string, query: Query) {
    try {
      const cartItem = await this.cartItemModel.findById(idCartItem);

      if (!cartItem) {
        return {
          status: HttpStatus.ERROR,
          message: 'Không tìm thấy sản phẩm trong giỏ hàng!!!',
        };
      }

      if (query.edit === 'increment') {
        cartItem.amount += 1;
      } else if (query.edit === 'decrement') {
        if (cartItem.amount === 1) {
          await this.cartModel.updateOne(
            { _id: cartItem.idCart },
            { $pull: { items: cartItem._id } },
          );

          await this.cartItemModel.findByIdAndDelete(idCartItem);
          return {
            status: HttpStatus.SUCCESS,
            message: 'Cập nhật giỏ hàng thành công!!!',
          };
        }
        cartItem.amount -= 1;
      }

      await cartItem.save();
      return {
        status: HttpStatus.SUCCESS,
        message: 'Cập nhật giỏ hàng thành công!!!',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Vui lòng thử lại sau!!!',
      };
    }
  }

  async deleteItemCart(idCartItem: string) {
    try {
      const cartItem = await this.cartItemModel.findByIdAndDelete(idCartItem);

      if (!cartItem) {
        return {
          status: HttpStatus.ERROR,
          message: 'Không tìm thấy sản phẩm trong giỏ hàng!!!',
        };
      }

      await this.cartModel.updateOne(
        { _id: cartItem.idCart },
        { $pull: { items: cartItem._id } },
      );

      return {
        status: HttpStatus.SUCCESS,
        message: 'Đã xoá sản phẩm khỏi giỏ hàng!!!',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Vui lòng thử lại sau!!!',
      };
    }
  }

  async deleteCart(idCart: string) {
    try {
      const result = await this.cartItemModel.deleteMany({ idCart });

      if (result.deletedCount === 0) {
        return {
          status: HttpStatus.ERROR,
          message: 'Không tìm thấy sản phẩm trong giỏ hàng!!!',
        };
      }

      await this.cartModel.findByIdAndUpdate({ _id: idCart }, { items: [] });

      return {
        status: HttpStatus.SUCCESS,
        message: 'Xóa giỏ hàng thành công!!!',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Vui lòng thử lại sau!!!',
      };
    }
  }
}
