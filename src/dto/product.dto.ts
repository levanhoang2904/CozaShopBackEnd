/* eslint-disable prettier/prettier */
// import { StringDecoder } from 'string_decoder';

import { ProductDetailDto } from './productDetail.dto';

export class ProductDto {
  id?: string;
  categoryId?: string;
  price?: number;
  productName?: string;
  fabric?: string;
  img?: string;
  sale: string;
  amount?: number;
  details: string[];
  size?: string;
  color?: string;
}

export class SearchProductDto {
  page?: number; //số trang đang chọn
  pageSize?: number; //số sản phẩm trên 1 trang
  categoryId?: string; // chọn theo danh mục category
  sale?: number; //chọn sản phẩn đang sale
  minPrice?: number; // giá tối thiểu
  maxPrice?: number; //giá tối đa
  fabric?: string; // chọn theo loại vải
  sortBy?: number; //giá cao thấp hoặc thấp cao là -1 và 1
  quantitySold?: boolean; // sắp xếp theo bán chạy 1
  newProduct?: boolean; // sắp xếp theo sản phẩm mới nhất 1
  sizes?: string[]; //   mảng lưu kích thước người dùng chọn
  colors?: string[];
  searchValue; // mảng lưu màu sắc người dùng chọn
}
