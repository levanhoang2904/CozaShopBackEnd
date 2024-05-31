/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductDto } from '../../dto/product.dto';
import Stripe from 'stripe';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
  ) {}
  async makePayment(payload: any) {
    const stripe = new Stripe(
      'sk_test_51P7ZcnGOZ4CROzycrOQxfMAQKtvj2yFbGYKrU7HZuB4Y9ywMOhyiqcVXI9GzQz7uHgmkIJbwoWOFSANERtsNp64N00381C6rTx',
    );
    const products: ProductDto[] = payload.products;
    const lineItems = products.map((product) => ({
      price_data: {
        currency: 'VND',
        product_data: {
          name: product.productName,
          description: 'Kích cỡ: ' + product.size + ' Màu: ' + product.color,
        },
        unit_amount: product.price,
      },
      quantity: product.amount,
    }));
    const productString = JSON.stringify(payload.products);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: lineItems,
      mode: 'payment',
      success_url: payload.idCart
        ? `http://localhost:3000/payment/success?id=${payload.idCart}&idAddress=${payload.idAddress}`
        : `http://localhost:3000/payment/success?products=${encodeURIComponent(productString)}&idUser=${payload.idUser}&idAddress=${payload.idAddress}`,
      cancel_url: 'http://localhost:4200/cart?error=error',
    });

    return {
      id: session.id,
    };
  }

  async successPayment(
    idCart: string,
    idAddress: string,
    products: ProductDto,
    idUser: string,
  ) {
    let cart: any;

    if (idCart) {
      cart = await this.cartService.getCartById(idCart);
    }

    if (cart) {
      const products = cart.items;

      for (let i = 0; i < products.length; i++) {
        await this.productService.decreaseAmountProduct(
          products[i].amount,
          products[i].idSize._id,
          products[i].idProduct._id,
        );
      }
      await this.orderService.postOrder(cart.idUser, idAddress, products);
      await this.cartService.deleteCart(idCart);
    } else {
      const product = await this.productService.getProductById(products[0].id);

      this.productService.decreaseAmountProduct(
        products[0].amount,
        products[0].idSize,
        products[0].id,
      );
      let productsPayload: any = [];
      productsPayload.push({
        idProduct: {
          _id: product._id,
          name: product.name,
          sale: product.sale,
          price: product.price,
        },
        idSize: {
          _id: products[0].idSize,
          size: products[0].size,
        },
        idColor: {
          _id: products[0].idColor,
          color: products[0].color,
          image: products[0].imgCover,
        },
        amount: products[0].amount,
        price: products[0].price,
      });

      await this.orderService.postOrder(idUser, idAddress, productsPayload);

      return {
        message: 'Thanh toán thành công',
        status: 200,
        redirectTo: 'http://localhost:4200/cart?message=success',
      };
    }
  }
}
