import { query } from 'express';
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { ProductDto, SearchProductDto } from '../../dto/product.dto';
import { Product } from '../../schemas/product.schema';
import { ProductDetail } from '../../schemas/productDetail.schema';
import { Query } from 'express-serve-static-core';
import { convertToSearchableFormat } from '../../global/searchUnikeyCode';
import { ProductSize } from '../../schemas/productSize.schema';
import { ProductDetailDto } from '../../dto/productDetail.dto';
import { ProductSizeDto } from '../../dto/productSize.dto';
import { Order } from '../../schemas/order.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductDetail.name)
    private productDetailModel: Model<ProductDetail>,
    @InjectModel(ProductSize.name) private productSize: Model<ProductSize>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async getAllProduct(page: number): Promise<object> {
    const products = await this.productModel.find();
    const data = await this.productModel
      .find()
      .sort({ createDate: -1 })
      .skip((page - 1) * 8)
      .limit(8);
    const pageCount = Math.ceil(products.length / 8);
    return {
      data,
      pageCount,
    };
  }

  async getProductsBySearch(query: Query): Promise<any> {
    //Search
    let queryKey: any = {};
    if (query.key) {
      const searchFormat = convertToSearchableFormat(query.key);
      const keySearch = {
        $or: [
          {
            name: {
              $regex: searchFormat,
              $options: 'i',
            },
          },
          {
            fabric: {
              $regex: searchFormat,
              $options: 'i',
            },
          },
        ],
      };

      queryKey = { ...keySearch };
    }

    // Sort
    let sortQuery: any = {};
    if (query.sort) {
      if (query.sort === 'asc') {
        sortQuery = { price: 1 };
      } else if (query.sort === 'desc') {
        sortQuery = { price: -1 };
      }
    }

    //Pagination
    const page: number = +query.page || 1;
    const pageSize: number = 8;

    let products = [];
    if (query.size || query.color) {
      let filterColor: any = {};
      if (query.color) {
        filterColor = { color: query.color };
      }

      let filterSize: any = {};
      if (query.size) {
        filterSize = { size: query.size };
      }

      products = await this.productModel
        .find({ ...queryKey })
        .sort(sortQuery)
        .populate([
          {
            path: 'categoryId',
          },
          {
            path: 'details',
            match: { ...filterColor },
            populate: {
              path: 'sizes',
              match: { ...filterSize },
            },
          },
        ])
        .lean();

      products = products.filter(
        (product) =>
          product.details.length > 0 &&
          product.details.some((detail) => detail.sizes.length > 0),
      );

      products = products.map((product: any) => {
        const { details, ...rest } = product;
        return rest;
      });
    } else {
      products = await this.productModel
        .find({ ...queryKey })
        .populate([
          { path: 'categoryId' },
          { path: 'details', populate: { path: 'sizes' } },
        ])
        .sort(sortQuery);
    }

    const totalCount = products.length;

    const skipCount = (page - 1) * pageSize;
    const paginatedProducts = products.slice(skipCount, skipCount + pageSize);

    const pageCount = Math.ceil(totalCount / pageSize);

    return {
      pageCount,
      data: paginatedProducts,
    };
  }

  async getProductDetail(id: string) {
    return await this.productModel.findById(id).populate([
      { path: 'categoryId' },
      {
        path: 'details',
        populate: {
          path: 'sizes',
        },
      },
    ]);
  }

  //phân trang, lấy theo category, lấy sắp xếp theo giá, mới nhất, sale
  async filterAndSortProducts(searchDto: SearchProductDto): Promise<object> {
    const {
      page = 1,
      pageSize = 9,
      sortBy = 0,
      quantitySold = false,
      newProduct = false,
      categoryId = '',
      sale = 0,
      minPrice = 0,
      maxPrice = 0,
      fabric = '',
      sizes = [],
      colors = [],
      searchValue = '',
    } = searchDto;

    const query: any = {
      ...(categoryId && { categoryId }),
      ...(sale && { sale: { $gt: 0 } }),
      price: { $gte: minPrice, ...(maxPrice > 0 && { $lte: maxPrice }) },
      ...(fabric && { fabric: { $regex: new RegExp(fabric, 'i') } }),
    };

    const searchValueKey = convertToSearchableFormat(searchValue);
    const key = { 
      $or: [
        {
          name: {
            $regex: searchValueKey,
            $options: 'i',
          },
        },
        {
          fabric: {
            $regex: searchValueKey,
            $options: 'i',
          },
        },
      ],
    };
    const queryBuilder = this.productModel
      .find({
        $and: [{ ...query }, { ...key }],
      })
      .populate([
        { path: 'categoryId' },
        { path: 'details', populate: { path: 'sizes' } },
      ]);

    let sortDirection: SortOrder; // Mặc định là không sắp xếp
    if (sortBy == 1) sortDirection = sortBy; // Sắp xếp thấp cao
    if (sortBy == -1) sortDirection = sortBy; //sắp xếp cao thấp

    let filteredProductIds;

    // lọc theo size và color
    if (sizes[0]!="" || colors[0]!="") {
      if (sizes[0]!="" && colors[0]!="") {
        queryBuilder.populate({
          path: 'details',
          match: { color: new RegExp(colors.join('|'), 'i') },
          populate: {
            path: 'sizes',
            match: {
              size: { $in: sizes },
              quantity: { $gt: 0 },
            },
          },
        });
      } else if (sizes[0] !== '') {
        queryBuilder.populate({
          path: 'details',
          populate: {
            path: 'sizes',
            match: {
              size: { $in: sizes },
              quantity: { $gt: 0 },
            },
          },
        });
      } else {
        queryBuilder.populate({
          path: 'details',
          match: { color: new RegExp(colors.join('|'), 'i') },
        });
      }

       filteredProductIds = (await queryBuilder).filter(product => 
       product.details.length > 0 && 
       (!sizes.length || product.details.some(detail => detail.sizes.length > 0)))
       .map(product => product._id);

      const pageCount = Math.ceil(filteredProductIds.length / pageSize);
      // Khởi tạo đối tượng sortCriteria rỗng
      const sortCriteria: { [key: string]: SortOrder | { $meta: any } } = {};
      if (sortDirection) sortCriteria.price = sortDirection;
      if (quantitySold)  sortCriteria.quantitySold = -1;
      if (newProduct)  sortCriteria.createDate = -1;
      
    const data = await this.productModel
      .find({ _id: { $in: filteredProductIds } })
      .sort(sortCriteria)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

      return { pageCount, data };
    }
    const sortCriteria: { [key: string]: SortOrder | { $meta: any } } = {};
    if (sortBy !== 0) sortCriteria.price = sortDirection; // Sắp xếp theo giá
    if (quantitySold) sortCriteria.quantitySold = -1; // Sắp xếp theo sản phẩm bán chạy
    if (newProduct) sortCriteria.createDate = -1; // Sắp xếp theo sản phẩm mới nhất
    
    // Thực hiện truy vấn để đếm tổng số sản phẩm và tính pageCount
    const totalProducts = await this.productModel.countDocuments({ $and: [{ ...query }, { ...key }] }).exec();
    const pageCount = Math.ceil(totalProducts / pageSize);
    
    // Thực hiện truy vấn để lấy dữ liệu với các tiêu chí sắp xếp và giới hạn kết quả
    const data = await queryBuilder
      .sort(sortCriteria)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return { pageCount, data };
  }

  async getSimilarProducts() {
    const count = await this.productModel.countDocuments();
    let random = Math.floor(Math.random() * count);
    if (random > 13) {
      random -= 4;
    }
    return this.productModel.find().skip(random).limit(4);
  }

  async decreaseAmountProduct(
    amount: number,
    idSize: string,
    idProduct: string,
  ) {
    const product = await this.productModel.findById(idProduct);

    if (product === null)
      return {
        message: 'Không tìm thấy sản phẩm',
        status: 300,
      };
    product.quantitySold += amount;
    product.save();

    const productSize = await this.productSize.findById(idSize);
    if (productSize) {
      productSize.quantity -= amount;
      productSize.save();
      return {
        message: 'Thành công',
        status: 200,
      };
    }
    return {
      message: 'Không tìm thấy size sản phẩm',
      status: 400,
    };
  }

  async isAmountProduct(idSize, amount) {
    const productSize: ProductSize = await this.productSize.findById(idSize);
    if (productSize.quantity > 0) return true;
    return false;
  }

  async getProductById(productId) {
    return await this.productModel
      .findById(productId)
      .select('name price sale');
  }

  async getAllInforProduct(page: number) {
    const products = await this.productModel.find();
    const data = await this.productModel
      .find()
      .populate([
        { path: 'categoryId' },
        { path: 'details', populate: { path: 'sizes' } },
      ])
      .sort({ createDate: -1 })
      .skip((page - 1) * 8)
      .limit(8);
    const pageCount = Math.ceil(products.length / 8);
    if (data) {
      return {
        data,
        pageCount,
        status: 200,
      };
    }
    return {
      message: 'Thất bại',
      status: 500,
    };
  }

  async createProduct(body: any, fileName) {
    const product = {
      name: body.productName,
      categoryId: body.categoryId,
      price: body.price,
      sale: body.sale,
      quantitySold: 0,
      fabric: body.fabric,
      path: fileName,
      details: [],
    };
    const data = await this.productModel.create(product);
    if (data) {
      return {
        message: 'Thêm thành công',
        status: 200,
      };
    }
    return {
      message: 'Thêm thất bại',
      status: 500,
    };
  }

  async deleteProduct(id: string) {
    const orders = await this.orderModel.find();
    const orderProducts = orders.filter((order) => {
      return order._idOrderDetail.some((orderDetail: any) => {
        return orderDetail.idProduct._id.toString() === id;
      });
    });

    if (orderProducts.length > 0)
      return {
        status: 405,
        message: 'Sản phẩm không thể xóa',
      };

    const data = await this.productModel.findByIdAndDelete(id);
    for (let i = 0; i < data.details.length; i++) {
      const dataDetail = await this.productDetailModel.findByIdAndDelete(data.details[i])
      for (let j = 0; j < dataDetail.sizes.length; j++) {
         await this.productSize.findByIdAndDelete(dataDetail.sizes[j])
      }
    }
    
    if (data) {
      return {
        message: 'Xóa thành công',
        status: 200,
      };
    }
    return {
      message: 'Xóa thất bại',
      status: 300,
    };
  }

  async updateProduct(
    id: string,
    productDto: ProductDto,
    fileName: string = '',
  ) {
    let data;
    if (fileName) {
      data = await this.productModel.findByIdAndUpdate(id, {
        name: productDto.productName,
        categoryId: productDto.categoryId,
        fabric: productDto.fabric,
        price: productDto.price,
        sale: productDto.sale,
        path: fileName,
      });
    } else {
      data = await this.productModel.findByIdAndUpdate(id, {
        name: productDto.productName,
        categoryId: productDto.categoryId,
        fabric: productDto.fabric,
        price: productDto.price,
        sale: productDto.sale,
      });
    }
    if (data) {
      data.save();
      return {
        message: 'Cập nhật thành công',
        status: 200,
      };
    }
    return {
      message: 'Cập nhật thất bại',
      status: 300,
    };
  }

  async checkIsExistsProductColor(id : string, color: string) {
    const produdctdb = await this.productModel
    .findById(id)
    .populate({ path: 'details' });
    return produdctdb.details.some(
      (item) => item.color.toLocaleLowerCase() === color.toLocaleLowerCase(),
    );
  }


  async createColorProdudct(
    productDetail: ProductDetailDto,
    id: string,
    fileName: string,
  ) {
  

    const checkIsExists = await this.checkIsExistsProductColor(id, productDetail.color)

    if (checkIsExists)
      return {
        status: 403,
        message: 'Màu sắc đã tồn tại',
      };
    const data = await this.productDetailModel.create({
      ...productDetail,
      image: fileName,
    });
    if (data) {
      const product: any = await this.productModel.findById(id);
      const detaiId = data._id.toString();
      product.details.push(detaiId);
      product.save();
      return {
        data: data,
        message: 'Thêm màu sắc thành công',
        status: 200,
      };
    }
    return {
      message: 'Thêm màu sắc thất bại',
      status: 300,
    };
  }

  async updateProductDetail(idProduct : string, id: string, color: string, fileName: string) {
    const checkIsExists = await this.checkIsExistsProductColor(idProduct, color)
    const productDetailCurrent = await this.productDetailModel.findById(id)
    if (checkIsExists && productDetailCurrent.color.toLocaleLowerCase() !== color.toLocaleLowerCase())
      return {
        status: 403,
        message: 'Màu sắc đã tồn tại',
      };
    const data = await this.productDetailModel.findByIdAndUpdate(
      id,
      {
        color,
        image: fileName,
      },
      { new: true },
    );
    if (data) {
      data.save();

      return {
        data,
        message: 'Cập nhật màu sắc thành công',
        status: 200,
      };
    }
    return {
      message: 'Cập nhật màu sắc thất bại',
      status: 300,
    };
  }

  async deleteProductDetail(id: string) {
    const orders = await this.orderModel.find();
    const orderProducts = orders.filter((order) => {
      return order._idOrderDetail.some((orderDetail: any) => {
        return orderDetail.idColor._id.toString() === id;
      });
    });
    if (orderProducts.length > 0)
      return {
        status: 405,
        message: 'Sản phẩm không thể xóa',
      };
    const data = await this.productDetailModel.findById(id);
    if (!data)
      return {
        message: 'Màu sắc không tồn tại',
        status: 404,
      };
    data.sizes.map(async (productSize) => {
      await this.productSize.findByIdAndDelete(productSize);
    });
    await this.productDetailModel.findByIdAndDelete(id);
    return {
      message: 'Xóa màu sắc thành công',
      status: 200,
    };
  }

  async checkIsExistsProductSize(productDetail, productSizeDto: ProductSizeDto) {
    const productDetailPopulate = await productDetail.populate({
      path: 'sizes',
    });
    return productDetailPopulate.sizes.some(
      (item) => item.size === productSizeDto.size,
    );
  }

  async createSizeProduct(id: string, productSizeDto: ProductSizeDto) {
    const productDetail: any = await this.productDetailModel.findById(id);
    if (!productDetail)
      return {
        message: 'Không tìm thấy màu sắc cần thêm kích cỡ',
        status: 404,
      };

   
    const checkIsExists = await this.checkIsExistsProductSize(productDetail, productSizeDto)
      
    if (checkIsExists)
      return {
        status: 403,
        message: 'Kích cỡ đã tồn tại',
      };

    const data = await this.productSize.create(productSizeDto);
    if (data) {
      productDetail.sizes.push(data._id);
      productDetail.save();
      return {
        data: data,
        message: 'Thêm kích cỡ thành công',
        status: 200,
      };
    }
    return {
      message: 'Thêm kích cỡ thất bại',
      status: 300,
    };
  }

  async updateSizeProduct(idDetail: string, id: string, productSize: ProductSizeDto) {
    const productDetail: any = await this.productDetailModel.findById(idDetail);
    const checkIsExists = await this.checkIsExistsProductSize(productDetail, productSize)
    const sizeCurrent = await this.productSize.findById(id)
    if (checkIsExists && sizeCurrent.size !== productSize.size)
      return {
        status: 403,
        message: 'Kích cỡ đã tồn tại',
      };
    const data = await this.productSize.findByIdAndUpdate(id, productSize, {
      new: true,
    });
    if (data) {
      data.save();
      return {
        data: data,
        message: 'Cập nhật kích cỡ thành công',
        status: 200,
      };
    }
    return {
      message: 'Cập nhật kích cỡ thất bại',
      status: 300,
    };
  }

  async deleteSizeProduct(id: string, idDetail: string) {
    if (await this.isUsedProduct(id))
      return {
        status: 405,
        message: 'Sản phẩm không thể xóa',
      };
    const productDetail = await this.productDetailModel.findById(idDetail);
    if (!productDetail) {
      return {
        message: 'Màu sắc không tồn tại',
        status: 200,
      };
    }
    const data = await this.productSize.findByIdAndDelete(id);
    if (data) {
      productDetail.sizes = productDetail.sizes.filter(
        (productSize) => productSize.toString() !== id,
      );
      productDetail.save();
      return {
        message: 'Xóa kích cỡ thành công',
        status: 200,
      };
    }
    return {
      message: 'Xóa kích cỡ thất bại',
      status: 300,
    };
  }

  async isUsedProduct(id: string): Promise<boolean> {
    const orders = await this.orderModel.find();
    const orderProducts = orders.filter((order) => {
      return order._idOrderDetail.some((orderDetail: any) => {
        return orderDetail.idSize._id.toString() === id;
      });
    });

    if (orderProducts.length > 0) return true;
    return false;
  }

  async getDetailSize(idSize: string) {
  const regex = new RegExp(idSize, 'i'); 

  const products = await this.productModel.find().populate([
    {
      path: 'details',
      populate: {
        path: 'sizes',
        match: {
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' }, // Convert ObjectId to string
              regex: regex
            }
          }
        }
      }
    }
  ]);

  let productDetailSize: any;
  for (const product of products) {
    const checkSizeInDetails = product.details.some(detail => detail.sizes.length > 0);
    if (checkSizeInDetails) {
      productDetailSize = product
      break; 
    }
  }
  if (productDetailSize) {
    productDetailSize.details = productDetailSize.details.filter(detail => detail.sizes.length > 0);
  }

  return{ data: productDetailSize, quantity:1}
}
}
