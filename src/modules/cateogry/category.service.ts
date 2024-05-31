/* eslint-disable prettier/prettier */
import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../schemas/category.schema';
import { HttpStatus } from '../../global/globalEnum';
import { Query } from 'express-serve-static-core';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../dto/category.dto';
import { Product } from '../../schemas/product.schema';
import { Post } from '../../schemas/post.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async getAllCateogries() {
    return await this.categoryModel.find();
  }

  async getAllCategoriesAdmin(query: Query): Promise<any> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 8;
    const skip = (page - 1) * limit;

    const countCategory = await this.categoryModel.countDocuments();
    const pageCount = Math.ceil(countCategory / limit);

    const categories = await this.categoryModel
      .find({})
      .skip(skip)
      .limit(limit);

    return {
      categories,
      pageCount,
    };
  }

  async getCategory(id: string): Promise<any> {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new HttpException(
        'Không tìm thấy bài viết tương ứng',
        HttpStatus.ERROR,
      );
    }

    return category;
  }

  async createCategory(createCategoryDTO: CreateCategoryDTO): Promise<any> {
    try {
      const category = await this.categoryModel.create(createCategoryDTO);
      if (category) {
        return {
          statusCode: 200,
          message: 'Tạo mới danh mục thành công!',
        };
      }
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        throw new HttpException('Tên danh mục đã tồn tại', HttpStatus.ERROR);
      }
      throw new HttpException('Không thể tạo danh mục', HttpStatus.ERROR);
    }
  }

  async updateCategory(
    id: string,
    updateCategoryDTO: UpdateCategoryDTO,
  ): Promise<any> {
    try {
      const category = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDTO,
      );

      if (!category) {
        throw new HttpException(
          'Không tìm thấy danh mục tương ứng',
          HttpStatus.ERROR,
        );
      } else {
        return {
          statusCode: 200,
          message: 'Cập nhật danh mục thành công!',
        };
      }
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        throw new HttpException('Tên danh mục đã tồn tại', HttpStatus.ERROR);
      }
      throw new HttpException('Không thể cập nhật danh mục', HttpStatus.ERROR);
    }
  }

  async deleteCategory(id: string): Promise<any> {
    try {
      const productExit = await this.productModel.findOne({ categoryId: id });
      const postExit = await this.postModel.findOne({ category: id });

      if (productExit || postExit) {
        return {
          statusCode: HttpStatus.ERROR,
          message:
            'Loại sản phẩm đã tham gia dữ liệu của hệ thống, không thể xoá!',
        };
      }

      const category = await this.categoryModel.findByIdAndDelete(id);
      if (!category) {
        throw new HttpException(
          'Không tìm thấy danh mục tương ứng',
          HttpStatus.ERROR,
        );
      }

      return {
        statusCode: 200,
        message: 'Xoá danh mục thành công!',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('Không thể xoá danh mục', HttpStatus.ERROR);
    }
  }
}
