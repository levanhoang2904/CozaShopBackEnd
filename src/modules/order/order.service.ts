/* eslint-disable prettier/prettier */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Order } from '../../schemas/order.schema';
import { Model } from 'mongoose';
import { OrderDetail } from '../../schemas/orderDetail.schema';
import { CartItem } from '../../schemas/cartItem.schema';
import { DataProductOrderDto, OrderVNPostDto, SearchOrderDto } from '../../dto/order.dto';
import axios from 'axios';
import crypto from 'crypto';
import { ProductSize } from '../../schemas/productSize.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderDetail.name) private orderDetailModel: Model<OrderDetail>,
    @InjectModel(ProductSize.name) private productSize: Model<ProductSize>,

  ) {}

  async postOrder(idUser: string, idAddress: string, products: CartItem[]) {

    let order:any
     order = await this.orderModel.create({
      _idUser: idUser,
      _idAddress: idAddress,
      status: 1,
      totalPrice: 0,
      _idOrderDetail: [],
    });
  
    products.map((product: any) => {
      const price =
        product.idProduct.price -
        product.idProduct.price * (product.idProduct.sale / 100);

      order._idOrderDetail.push({
        idProduct: product.idProduct,
        idColor: product.idColor,
        idSize: product.idSize,
        amount: product.amount,
        price: price,
        comment: false,
      });
      order.totalPrice += product.amount * price;
    });
  
    await order.save();
      this.createOrderVNPost();

    return {
      message: 'Đặt hàng thành công',
      status: 200,
    };
  }

  async postOrderFromAdmin(products: any) {
    let order:any
       order = await this.orderModel.create({
        status: 4,
        totalPrice: 0,
        _idOrderDetail: [],
      });

    products.map((product: any) => {
      const price =
        product.idProduct.price -
        product.idProduct.price * (product.idProduct.sale / 100);

      order._idOrderDetail.push(product);
      order.totalPrice += product.amount * price;
    });
    await order.save();
    return {
      message: 'Đặt hàng thành công',
      status: 200,
    };
  }

  async getOrder(idProduct: string, idUser: string): Promise<boolean> {
    const data: any = await this.orderModel
      .findOne({ _idUser: idUser })
      .populate({ path: '_idOrderDetail' });

    if (data) {
      return true;
    }
    return false;
  }
  async getOrderById(idOrder: string): Promise<any> {
   return (await this.orderModel.findById(idOrder)).populate({ path: '_idAddress' })
  }
  
  async searchOrders(searchOrderDto: SearchOrderDto): Promise<any> {
    const { page = 1, pageSize = 20, startDay, endDay, status, searchValue } = searchOrderDto;
    const skip = (page - 1) * pageSize;
    const query: any = {};

    if (startDay && endDay) query['createdAt'] = { $gte: startDay, $lte: endDay };
    
    if (status != -2) query['status'] = status;

    if (searchValue) query['idOrderVNPost'] = searchValue

    const orders = await this.orderModel
      .find(query)
      .populate({ path: '_idAddress' },)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      const totalCount = await this.orderModel.countDocuments(query);
      
    return { 
      pageCount: Math.ceil(totalCount / pageSize),
      data: orders,      
    };
  }

  async updateOrder(idUser: string, idProduct: string) {
    const data: any = await this.orderModel
      .findOne({ _idUser: idUser })
      .populate({ path: '_idOrderDetail' });
    if (!data) return false;
    let idOrderDetail = '';
    data._idOrderDetail.map((orderDetail) => {
      if (orderDetail._idProduct === idProduct) {
        idOrderDetail = orderDetail._id;
      }
    });

    await this.orderDetailModel.findOneAndUpdate(
      { _id: idOrderDetail },
      { isComment: true },
    );

    return true;
  }
  async addNameStaff(idOrder: string,name: string) {
    await this.orderModel.findByIdAndUpdate(idOrder,{ nameStaff: name });
  }
  async addIdVNPost(idOrder: string,idOrderVNPost: string) {
    await this.orderModel.findByIdAndUpdate(idOrder,{ idOrderVNPost: idOrderVNPost, status:1});
  }

  async createOrderDetail() {
    return await this.orderDetailModel.create({ products: [{}] });
  }

  async getListOrderByUser(idUser: string, page: number) {  
    const perPage = 10;
    const skip = (page - 1) * perPage;

    const totalCount = await this.orderModel.countDocuments({ _idUser: idUser });
    const pageCount = Math.ceil(totalCount / perPage);

    const data = await this.orderModel
      .find({ _idUser: idUser })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    return { pageCount, data };
  }

  async updateStatusOrder(idOrder: string, status: number) {
    await this.orderModel.findByIdAndUpdate(idOrder,{ status: status });
  }

  async deleteOrder(idOrder: string) {
    try {
      const result = await this.orderModel.deleteOne({ _id: idOrder });
      if (result.deletedCount === 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async updateProductInOrder(dataProductOrder: DataProductOrderDto) {
    const orderId = dataProductOrder._id; 
    const number = dataProductOrder.number; 

    const updatePath1 = `_idOrderDetail.${number}.idColor._id`;
    const updatePath2 = `_idOrderDetail.${number}.idColor.color`;
    const updatePath3 = `_idOrderDetail.${number}.idColor.image`;
    const updatePath4 = `_idOrderDetail.${number}.idSize._id`;
    const updatePath5 = `_idOrderDetail.${number}.idSize.size`;

    let updateQuery = {};
    updateQuery[updatePath1] = dataProductOrder._idColor;
    updateQuery[updatePath2] = dataProductOrder.color;
    updateQuery[updatePath3] = dataProductOrder.image;
    updateQuery[updatePath4] = dataProductOrder._idSize;
    updateQuery[updatePath5] = dataProductOrder.size;
    
    const updatedOrder = await this.orderModel.findOneAndUpdate(
        { "_id": orderId },
        { "$set": updateQuery },
        { new: true }
    );
    await this.productSize.findOneAndUpdate(
      { "_id": dataProductOrder._idSize },
      { "$inc": { "quantity": -dataProductOrder.amount } })
      await this.productSize.findOneAndUpdate(
        { "_id": dataProductOrder._idSizeold },
        { "$inc": { "quantity": dataProductOrder.amount } })

    return updatedOrder;
  }
  

  async createOrderVNPost(): Promise<any> {
       const newOrder= await this.getNewOrder()
       let nameOrder = ""
       let total =0;
       if(newOrder._idOrderDetail.length==1){
        total= newOrder._idOrderDetail[0].amount
        nameOrder="Bộ: "+newOrder._idOrderDetail[0].idProduct.name+", Màu: "+newOrder._idOrderDetail[0].idColor.color+", Size: "+ newOrder._idOrderDetail[0].idSize.size +", SL: "+newOrder._idOrderDetail[0].amount
       }
       else{
        for (let i = 0; i < newOrder._idOrderDetail.length; i++) {
          const item = newOrder._idOrderDetail[i];
          const productInfo = `${i+1}: ${item.idProduct.name} - Màu: ${item.idColor.color} - Size: ${item.idSize.size} - SL: ${item.amount}`;
          total += item.amount

          if (i === 0) {
              nameOrder += productInfo;
          } else {
              nameOrder += "\n" + productInfo; // Thêm xuống hàng sau mỗi chuỗi sản phẩm
          }
      }
       }
       if (nameOrder.length > 350) {
        nameOrder = nameOrder.substring(0, 350) + ' ...';
       }
       nameOrder=nameOrder+"\n(Tổng sản phẩm: "+total+")"

    const order = new OrderVNPostDto();
    order.informationOrder.receiverName=newOrder._idAddress.name
    order.informationOrder.receiverAddress= newOrder._idAddress.detailAddress
    order.informationOrder.receiverProvinceCode=await this.getIdProvince(newOrder._idAddress.city)
    order.informationOrder.receiverDistrictCode= await this.getIdDistrict(order.informationOrder.receiverProvinceCode,newOrder._idAddress.district)
    order.informationOrder.receiverCommuneCode= await this.getIdCommune(order.informationOrder.receiverDistrictCode,newOrder._idAddress.ward)
    order.informationOrder.receiverPhone= newOrder._idAddress.phone
    order.informationOrder.deliveryInstruction= newOrder._idAddress.note
    order.informationOrder.contentNote= nameOrder
    order.informationOrder.weight= (total*300).toString()

    const https = require('https');
    const crypto = require('crypto');
    let url = 'https://connect-my.vnpost.vn/customer-partner/CreateOrder'; // Thay đổi URL nếu cần
      
    try {
      const response = await axios.post<any>(url, order, {
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'token': process.env.TOKENVNPOST,
          },
          httpsAgent: new https.Agent({
              secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
          }),
      });
      if(this.addIdOrderVNPostToOrder(newOrder._id.toString(),response.data.itemCode)) 
         return true
  } catch (error) {
    await  this.orderModel.updateOne(
      { _id: newOrder._id },
      { status: 0 },
      );
      console.error('Error calling API:', error);
  }
    return false
  }

  async getIdProvince(nameProvince: string) {
    const url = 'https://connect-my.vnpost.vn/customer-partner/getAllProvince';
    const token =  process.env.TOKENVNPOST
    const https = require('https');
    const crypto = require('crypto');
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'token': token,
            },
            httpsAgent: new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            }),
        });
        for(let item of response.data){
          if(this.compareStrings( item.provinceName,nameProvince)){
            return item.provinceCode            
          }
        }
        return "0"
  
}

async getIdDistrict(idProvince: string, nameDistrict: string) {
  const url = 'https://connect-my.vnpost.vn/customer-partner/getAllDistrict';
  const token =  process.env.TOKENVNPOST
  const https = require('https');
  const crypto = require('crypto');
      const response = await axios.get(url, {
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'token': token,
          },
          httpsAgent: new https.Agent({
              secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
          })})
    for(let item of response.data){
      if(this.compareStrings( item.districtName, nameDistrict)&&item.provinceCode==idProvince){
        return item.districtCode          
      }
    }
    return "0"
}

async getIdCommune(idDistrict: string, nameCommune: string) {
  const url = 'https://connect-my.vnpost.vn/customer-partner/getAllCommune';
  const token =  process.env.TOKENVNPOST
  const https = require('https');
  const crypto = require('crypto');
 
      const response = await axios.get(url, {
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'token': token,
          },
          httpsAgent: new https.Agent({
              secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
          }),
      });
      for(let item of response.data){
        if(this.compareStrings( item.communeName, nameCommune)&&item.districtCode==idDistrict){
          return item.communeCode      
        }
      }
      return "0"
}

async getNewOrder(){
  return await this.orderModel.findOne().sort({ createdAt: -1 }).limit(1).populate({ path: '_idAddress' });
}

async addIdOrderVNPostToOrder(idOrder: string, idVNPost: string){
  try {
    const updatedOrder = await this.orderModel.findOneAndUpdate({ _id: idOrder }, { idOrderVNPost: idVNPost });
    if (!updatedOrder) {
        return false; // Không tìm thấy đơn hàng để cập nhật
    }
    return true; // Cập nhật thành công
} catch (error) {
    console.error(`Lỗi khi cập nhật đơn hàng: ${error.message}`);
    return false; // Xảy ra lỗi
}
}

  // so sánh 2 chuôi phường xã tỉnh thành
compareStrings(str1: string, str2: string) {
    if(str1===str2) return true
    if(str1=="Tỉnh Bà Rịa Vũng Tàu" && str2=="Tỉnh Bà Rịa - Vũng Tàu") return true
    const dotIndex = str1.indexOf('.');
    if (dotIndex !== -1) {
        const substring1 = str1.substring(dotIndex + 1);
        return str2.includes(substring1);
    }
    return false;
  }
}
