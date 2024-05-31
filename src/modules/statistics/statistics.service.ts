/* eslint-disable prettier/prettier */
import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';

import { Order } from '../../schemas/order.schema';
import { User } from '../../schemas/user.schema';
import { Category } from '../../schemas/category.schema';
import { Product } from '../../schemas/product.schema';
import { HttpStatus } from '../../global/globalEnum';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  private getStartOfWeek(): Date {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  async statistiscTopProduct() {
    const productsTop = await this.productModel
      .find()
      .populate([{ path: 'categoryId' }, { path: 'details' }])
      .sort({ quantitySold: -1 })
      .limit(10);
    return productsTop;
  }

  async statistiscBotProduct() {
    const productsBot = await this.productModel
      .find()
      .populate([{ path: 'categoryId' }, { path: 'details' }])
      .sort({ quantitySold: 1 })
      .limit(10);
    return productsBot;
  }

  async staitisticsRenevue(option: string, year: number) {
    let dateStart = new Date();
    const dateEnd = new Date();
    if (year < dateEnd.getFullYear()) {
      dateEnd.setDate(31);
      dateEnd.setMonth(11);
      dateEnd.setFullYear(year);
      dateEnd.setHours(23, 59, 59, 999);
    }
    if (option === 'week') {
      dateStart = this.getStartOfWeek();
      dateStart.setHours(0, 0, 0, 0);
    } else if (option === 'year') {
      dateStart.setHours(0, 0, 0, 0);
      dateStart.setDate(1);
      dateStart.setMonth(0);
      dateStart.setFullYear(year);
    }

    const orders = await this.orderModel.find({
      createdAt: { $gte: dateStart, $lt: dateEnd },
    });
    const data: { month?: number; renevue: number; day?: string }[] = [];
    if (option === 'year') {
      for (let i = 1; i <= dateEnd.getMonth() + 1; i++) {
        let renevue: number = 0;

        orders.map((order) => {
          if (order.createdAt.getMonth() + 1 === i) {
            renevue += order.totalPrice;
          }
        });
        data.push({
          month: i,
          renevue,
        });
      }
    } else if (option === 'week') {
      for (let i = dateStart.getDate(); i <= dateEnd.getDate(); i++) {
        let renevue: number = 0;
        orders.map((order) => {
          if (order.createdAt.getDate() === i) renevue += order.totalPrice;
        });
        const dayVn = new Date(dateStart);
        dayVn.setDate(i);
        dayVn.setHours(dateStart.getHours() + 7);

        data.push({
          day: dayVn.toISOString().split('T')[0],
          renevue,
        });
      }
    }
    return data;
  }
  
  async getOrderStats(period: any): Promise<any> {
    const currentPeriod = new Date();
    let startCurrentPeriod: Date;
    let startPreviousPeriod: Date;
    let endPreviousPeriod: Date;

    switch (period) {
      case 'day':
        startCurrentPeriod = new Date(
          currentPeriod.getFullYear(),
          currentPeriod.getMonth(),
          currentPeriod.getDate(),
        );
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setDate(startPreviousPeriod.getDate() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      case 'month':
        startCurrentPeriod = new Date(
          currentPeriod.getFullYear(),
          currentPeriod.getMonth(),
          1,
        );
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setMonth(startPreviousPeriod.getMonth() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      case 'year':
        startCurrentPeriod = new Date(currentPeriod.getFullYear(), 0, 1);
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setFullYear(startPreviousPeriod.getFullYear() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      default:
        throw new HttpException('Invalid time period', HttpStatus.ERROR);
    }

    const currentCount = await this.orderModel
      .countDocuments({
        createdAt: { $gte: startCurrentPeriod, $lt: currentPeriod },
      })
      .exec();

    const previousCount = await this.orderModel
      .countDocuments({
        createdAt: { $gte: startPreviousPeriod, $lt: endPreviousPeriod },
      })
      .exec();

    let growthPercentage: number | null = null;
    if (previousCount !== 0) {
      growthPercentage = parseFloat(
        (((currentCount - previousCount) / previousCount) * 100).toFixed(2),
      );
    } else {
      growthPercentage = currentCount > 0 ? 100 : 0;
    }

    return {
      current: currentCount,
      previos: previousCount,
      growth: growthPercentage,
    };
  }

  async getRevuene(period: any): Promise<any> {
    const currentPeriod = new Date();
    let startCurrentPeriod: Date;
    let startPreviousPeriod: Date;
    let endPreviousPeriod: Date;

    switch (period) {
      case 'day':
        startCurrentPeriod = new Date(
          currentPeriod.getFullYear(),
          currentPeriod.getMonth(),
          currentPeriod.getDate(),
        );
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setDate(startPreviousPeriod.getDate() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      case 'month':
        startCurrentPeriod = new Date(
          currentPeriod.getFullYear(),
          currentPeriod.getMonth(),
          1,
        );
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setMonth(startPreviousPeriod.getMonth() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      case 'year':
        startCurrentPeriod = new Date(currentPeriod.getFullYear(), 0, 1);
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setFullYear(startPreviousPeriod.getFullYear() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      default:
        throw new HttpException('Invalid time period', HttpStatus.ERROR);
    }

    const currentTotal = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startCurrentPeriod, $lt: currentPeriod },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    const previousTotal = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startPreviousPeriod, $lt: endPreviousPeriod },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    const currentTotalAmount = currentTotal[0]?.total || 0;
    const previousTotalAmount = previousTotal[0]?.total || 0;

    let totalGrowthPercentage: number | null = null;
    if (previousTotalAmount !== 0) {
      totalGrowthPercentage = parseFloat(
        (
          ((currentTotalAmount - previousTotalAmount) / previousTotalAmount) *
          100
        ).toFixed(2),
      );
    } else {
      totalGrowthPercentage = currentTotalAmount > 0 ? 100 : 0;
    }

    return {
      current: currentTotalAmount,
      previous: previousTotalAmount,
      growth: totalGrowthPercentage,
    };
  }

  async getUserStats(period: any): Promise<any> {
    const currentPeriod = new Date();
    let startCurrentPeriod: Date;
    let startPreviousPeriod: Date;
    let endPreviousPeriod: Date;

    switch (period) {
      case 'day':
        startCurrentPeriod = new Date(
          currentPeriod.getFullYear(),
          currentPeriod.getMonth(),
          currentPeriod.getDate(),
        );
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setDate(startPreviousPeriod.getDate() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      case 'month':
        startCurrentPeriod = new Date(
          currentPeriod.getFullYear(),
          currentPeriod.getMonth(),
          1,
        );
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setMonth(startPreviousPeriod.getMonth() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      case 'year':
        startCurrentPeriod = new Date(currentPeriod.getFullYear(), 0, 1);
        startPreviousPeriod = new Date(startCurrentPeriod);
        startPreviousPeriod.setFullYear(startPreviousPeriod.getFullYear() - 1);
        endPreviousPeriod = startCurrentPeriod;
        break;
      default:
        throw new HttpException('Invalid time period', HttpStatus.ERROR);
    }

    const currentCount = await this.userModel
      .countDocuments({
        createdAt: { $gte: startCurrentPeriod, $lt: currentPeriod },
      })
      .exec();

    const previousCount = await this.userModel
      .countDocuments({
        createdAt: { $gte: startPreviousPeriod, $lt: endPreviousPeriod },
      })
      .exec();

    let growthPercentage: number | null = null;
    if (previousCount !== 0) {
      growthPercentage = parseFloat(
        (((currentCount - previousCount) / previousCount) * 100).toFixed(2),
      );
    } else {
      growthPercentage = currentCount > 0 ? 100 : 0;
    }

    return {
      current: currentCount,
      previous: previousCount,
      growth: growthPercentage,
    };
  }

  async getStaticAdmin(query: Query): Promise<any> {
    try {
      const queryOrder = query.order || 'day';
      const queryRevenue = query.revenue || 'day';
      const queryUser = query.user || 'day';

      const orderStat = await this.getOrderStats(queryOrder);
      const revenueStat = await this.getRevuene(queryRevenue);
      const userStat = await this.getUserStats(queryUser);

      return {
        startCode: 200,
        stats: {
          order: orderStat,
          revenue: revenueStat,
          user: userStat,
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('Không thể tạo thống kê', HttpStatus.ERROR);
    }
  }

  async getStatCategory(): Promise<any> {
    const categories = await this.categoryModel.find().exec();
    const totalProductCount = await this.productModel.countDocuments().exec();

    const stats = [];

    for (const category of categories) {
      const productCount = await this.productModel
        .countDocuments({ categoryId: category._id })
        .exec();

      const percentage = (productCount / totalProductCount) * 100;

      stats.push({
        name: category.namecategory,
        count: productCount,
        percentage: parseFloat(percentage.toFixed(2)),
      });
    }

    return {
      statusCode: 200,
      stats,
    };
  }

  async getDailyOrdersForCurrentWeek(): Promise<any> {
    const currentDate = new Date();
    const startOfWeek = this.getStartOfWeek();
    const dailyOrders = [];

    for (let i = 1; i <= currentDate.getDay(); i++) {
      const startDate = new Date(startOfWeek);
      startDate.setDate(startDate.getDate() + i - 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const count = await this.orderModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      const currentDayVN = startDate;
      currentDayVN.setHours(startDate.getHours() + 7);

      dailyOrders.push({
        date: currentDayVN.toISOString().split('T')[0],
        totalOrders: count,
      });
    }

    return {
      statusCode: 200,
      dailyOrders,
    };
  }
}
