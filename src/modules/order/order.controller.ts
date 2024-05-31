/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post, Query,Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { DataProductOrderDto, SearchOrderDto } from '../../dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}
  @Post('/post')
  postOrder(@Body() data: any) {
     return this.orderService.postOrderFromAdmin(data);
  }
  @Get(':idUser/:idProduct')
  getOrders(
    @Param('idProduct') idProduct: string,
    @Param('idUser') idUser: string,
  ) {
    return this.orderService.getOrder(idProduct, idUser);
  }

  @Get('/update/:idUser/:idProduct')
  upateOrder(
    @Param('idUser') idUser: string,
    @Param('idProduct') idProduct: string,
  ) {
    return this.orderService.updateOrder(idUser, idProduct);
  }

  @Post('getListOrderByUser/:idUser/:page')
  async getListOrderByUser(@Param('idUser') idUser: string,
  @Param('page') page: number): Promise<any> {
    return this.orderService.getListOrderByUser(idUser,page);
  }

  @Post('/updateStatusOrder/:idOrder/:status')
  async updateStatusOrder(
    @Param('idOrder') idOrder: string,
    @Param('status') status: number,
  ): Promise<any> {
    return this.orderService.updateStatusOrder(idOrder, status);
  }

  @Post('/deleteOrder/:idOrder')
  async deleteOrder(@Param('idOrder') idOrder: string): Promise<any> {
    return this.orderService.deleteOrder(idOrder);
  } 
  
  @Post('/searchOrders/')
  async searchOrders(@Body() searchOrderDto: SearchOrderDto): Promise<any> {
    return this.orderService. searchOrders(searchOrderDto);
  }

  @Post('/getOrderById/:idOrder')
  async getOrderById(@Param('idOrder') idOrder: string): Promise<any> {
    return this.orderService.getOrderById(idOrder);
  }

  @Post('/addNameStaff/:name/:idOrder')
  async addNameStaff(@Param('name') name: string,@Param('idOrder') idOrder: string): Promise<any>{
    return this.orderService.addNameStaff(idOrder,name);
  }

  @Post('/updateProductInOrder')
  async updateProductInOrder(@Body() dataProductOrder: DataProductOrderDto): Promise<any>{
    return this.orderService.updateProductInOrder(dataProductOrder);
  }

  @Post('/addIdVNPost/:idOrder/:idVNPost')
  async addIdVNPost(
  @Param('idOrder') idOrder: string,
  @Param('idVNPost') idVNPost: string): Promise<any>{
    return this.orderService.addIdVNPost(idOrder,idVNPost);
  }
}
