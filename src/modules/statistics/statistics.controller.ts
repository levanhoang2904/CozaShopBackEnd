/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}
  @Get('/top/products')
  getStatisticsProductTop() {
    return this.statisticsService.statistiscTopProduct();
  }

  @Get('/bot/products')
  getStatisticsProductBot() {
    return this.statisticsService.statistiscBotProduct();
  }

  @Get('renevue')
  getStatisticsRenevue(
    @Query('option') option: string,
    @Query('year') year: number,
  ) {
    const dayCurrent = new Date();
    if (!year || year < dayCurrent.getFullYear() - 5) {
      year = dayCurrent.getFullYear();
    }
    return this.statisticsService.staitisticsRenevue(option, year);
  }

  @Get('admin')
  getStaticAdmin(@Query() query: any): Promise<any> {
    return this.statisticsService.getStaticAdmin(query);
  }

  @Get('admin/category')
  getStaticCategoryAdmin(): Promise<any> {
    return this.statisticsService.getStatCategory();
  }

  @Get('admin/weeky')
  getStaticOrderWeeky(): Promise<any> {
    return this.statisticsService.getDailyOrdersForCurrentWeek();
  }
}
