/* eslint-disable prettier/prettier */
import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';

import { Post } from '../../schemas/post.schema';
import { CreatePostDTO, UpdatePostDTO } from '../../dto/post.dto';
import { HttpStatus } from '../../global/globalEnum';
import { convertToSearchableFormat } from '../../global/searchUnikeyCode';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDTO: CreatePostDTO): Promise<any> {
    try {
      const post = await this.postModel.create(createPostDTO);
      if (post) {
        return {
          statusCode: 200,
          message: 'Tạo mới bài viết thành công!',
        };
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('Không thể tạo bài viết', HttpStatus.ERROR);
    }
  }

  async getAll(query: Query): Promise<any> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 8;
    const search = query.search || '';
    const searchFormat = convertToSearchableFormat(search);
    const skip = (page - 1) * limit;

    const findQuery: any = {
      $or: [
        {
          title: {
            $regex: searchFormat,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: searchFormat,
            $options: 'i',
          },
        },
      ],
    };

    if (query.category) {
      findQuery.category = query.category;
    }

    const countPost = await this.postModel.countDocuments(findQuery);
    const pageCount = Math.ceil(countPost / limit);

    const posts = await this.postModel
      .find(findQuery)
      .populate({ path: 'category', select: '-note' })
      .sort({ createDate: -1 })
      .skip(skip)
      .limit(limit);

    return {
      posts,
      pageCount,
    };
  }

  async getDetail(id: string): Promise<any> {
    const post = await this.postModel
      .findById(id)
      .populate({ path: 'category' });

    if (!post) {
      throw new HttpException(
        'Không tìm thấy bài viết tương ứng',
        HttpStatus.ERROR,
      );
    }

    return post;
  }

  async update(id: string, updatePostDTO: UpdatePostDTO): Promise<any> {
    try {
      const post = await this.postModel.findByIdAndUpdate(id, updatePostDTO);
      if (!post) {
        throw new HttpException(
          'Không tìm thấy bài viết tương ứng',
          HttpStatus.ERROR,
        );
      } else {
        return {
          statusCode: 200,
          message: 'Cập nhật bài viết thành công!',
        };
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('Không thể chỉnh sửa bài viết', HttpStatus.ERROR);
    }
  }

  async delete(id: string): Promise<any> {
    try {
      const post = await this.postModel.findByIdAndDelete(id);
      if (!post) {
        throw new HttpException(
          'Không tìm thấy bài viết tương ứng',
          HttpStatus.ERROR,
        );
      }

      return {
        statusCode: 200,
        message: 'Xoá bài viết thành công!',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('Không thể xoá bài viết', HttpStatus.ERROR);
    }
  }
}
