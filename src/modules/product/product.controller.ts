/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Query,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { SearchProductDto } from '../../dto/product.dto';
import { storageConfig } from 'helpers/config';
import { extname } from 'path';
import { RolesGuard } from '../../guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { ProductSizeDto } from '../../dto/productSize.dto';
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @UseGuards(new RolesGuard(['user', 'admin']))
  @UseGuards(AuthGuard('jwt'))
  getAllProduct(@Query() query: any): Promise<object> {
    if (query.page) {
      return this.productService.getAllProduct(query.page);
    }
    return this.productService.getAllProduct(1);
  }
  @Get('/search')
  async getProductsBySearch(@Query() query: any): Promise<any> {
    return await this.productService.getProductsBySearch(query);
  }

  @Get('/detail')
  getDetail(@Query() query: any) {
    if (query.id) {
      return this.productService.getProductDetail(query.id);
    }
    return {
      message: 'Không thể lấy chi tiết sản phẩm',
      status: 500,
    };
  }

  @Post()
  async filterAndSortProducts(
    @Body() searchDto: SearchProductDto,
  ): Promise<object> {
    return this.productService.filterAndSortProducts(searchDto);
  }

  @Get('/similar')
  getSimilarProducts() {
    return this.productService.getSimilarProducts();
  }

  @Patch()
  decreaseAmountProduct(@Query() query) {
    return this.productService.decreaseAmountProduct(
      query.amount,
      query.id,
      query.idProduct,
    );
  }

  @Get('/all')
  @UseGuards(new RolesGuard(['user', 'admin']))
  @UseGuards(AuthGuard('jwt'))
  getAllInforProduct(@Query() query) {
    return this.productService.getAllInforProduct(query.page);
  }

  // @UseGuards(new RolesGuard(['admin']))
  // @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('uploadPhoto', {
      storage: storageConfig('images'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async createProduct(@Body() body, @UploadedFile() file: Express.Multer.File) {
    return this.productService.createProduct(
      JSON.parse(body.data),
      file.filename,
    );
  }

  @Delete()
  @UseGuards(new RolesGuard(['admin']))
  @UseGuards(AuthGuard('jwt'))
  deleteProduct(@Query() query) {
    return this.productService.deleteProduct(query.id);
  }

  @Patch('/update')
  @UseInterceptors(
    FileInterceptor('uploadPhoto', {
      storage: storageConfig('images'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  updateProduct(
    @Query() query,
    @Body() productDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const product = JSON.parse(productDto.data);
    if (file)
      return this.productService.updateProduct(
        query.id,
        productDto,
        file.filename,
      );
    return this.productService.updateProduct(query.id, product);
  }

  @Post('/create/detail')
  @UseInterceptors(
    FileInterceptor('photoColor', {
      storage: storageConfig('images'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  createProductDetail(
    @Body() productDetail,
    @UploadedFile() file: Express.Multer.File,
    @Query() query,
  ) {
    return this.productService.createColorProdudct(
      productDetail,
      query.id,
      file.filename,
    );
  }

  @Patch('update/detail')
  @UseInterceptors(
    FileInterceptor('photoColor', {
      storage: storageConfig('images'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.webp'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Loại file upload không hợp. Vui lòng chọn các loại file: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  updateProductDetail(
    @Body() productDetail,
    @UploadedFile() file: Express.Multer.File,
    @Query() query,
  ) {
    let fileName;
    if (file) {
      fileName = file.filename;
    }
    return this.productService.updateProductDetail(
      query.idProduct,
      query.id,
      productDetail.color,
      fileName,
    );
  }

  @Delete('/delete/detail')
  deleteProductDetail(@Query() query) {
    return this.productService.deleteProductDetail(query.id);
  }
  @Post('/create/size')
  createSizeProduct(@Query() query, @Body() productSize: ProductSizeDto) {
    return this.productService.createSizeProduct(query.id, productSize);
  }

  @Patch('update/size')
  updateSizeProduct(@Query() query, @Body() productSize: ProductSizeDto) {
    return this.productService.updateSizeProduct(query.idDetail, query.id, productSize);
  }

  @Delete('/delete/size')
  deleteSizeProduct(@Query() query) {
    return this.productService.deleteSizeProduct(query.id, query.idDetail);
  }

  @Get('/getDetailSize/:idSize/')
  async getDetailSize(@Param('idSize') idSize: string ): Promise<any>{
    return this.productService.getDetailSize(idSize)
  }
}
