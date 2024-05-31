/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../dto/category.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getAllCateogries() {
    return this.categoryService.getAllCateogries();
  }

  @Get('admin')
  getAllCategoriesAdmin(@Query() query: any) {
    return this.categoryService.getAllCategoriesAdmin(query);
  }

  @Get('admin/:id')
  getCategoryAdmin(@Param('id') id: string) {
    return this.categoryService.getCategory(id);
  }

  @Post('admin')
  createCategoryAdmin(@Body() createCategoryDTO: CreateCategoryDTO) {
    return this.categoryService.createCategory(createCategoryDTO);
  }

  @Patch('admin/:id')
  updateCategoryAdmin(
    @Param('id') id: string,
    @Body() updateCategoryDTO: UpdateCategoryDTO,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDTO);
  }

  @Delete('admin/:id')
  deleteCategoryAdmin(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
