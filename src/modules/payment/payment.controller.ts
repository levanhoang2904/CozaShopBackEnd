/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { ProductDto } from '../../dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  makePayment(@Body() productDto: ProductDto[]) {
    return this.paymentService.makePayment(productDto);
  }

  @Get('/success')
  async succesPayment(@Query() query, @Res() res) {
    let products: any = [];
    if (query.products) products = JSON.parse(query.products);
    await this.paymentService.successPayment(
      query.id,
      query.idAddress,
      products,
      query.idUser,
    );
    return res.redirect('http://localhost:4200/cart?message=success');
  }
}
