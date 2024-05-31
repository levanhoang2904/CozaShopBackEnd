/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddressDto, UserDto, UserSearchDto } from '../../dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getDetailUser(@Req() request: Request) {
    try {
      if ('user' in request) {
        return {
          data: request.user,
          message: 'Thành công',
          status: 200,
        };
      } else
        return {
          message: 'Vui lòng đăng nhập lại',
          status: 401,
        };
    } catch (error) {
      return {
        message: 'Vui lòng đăng nhập lại',
        status: 401,
      };
    }
  }
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserByid(id);
  }

  @Get('/all')
  async getAllUser(): Promise<any> {
    return this.userService.getAllUser();
  }

  @Post('/update')
  async updateProfile(@Body() userDto: UserDto): Promise<boolean> {
    return this.userService.updateProfile(userDto);
  }

  //lấy user và toàn bộ địa chỉ của nó
  @Get('/address/:id')
  async getUserAndAddress(@Param('id') userId: string): Promise<boolean> {
    return this.userService.getUserAndAddress(userId);
  }
  //thêm địa chỉ cho user
  @Post('/AddAddress')
  async AddAddressToUser(@Body() addressDto: AddressDto): Promise<boolean> {
    return this.userService.AddAddressToUser(addressDto);
  }
  //sửa địa chỉ tương ứng
  @Post('/UpdateAddress')
  async UpdateAddress(@Body() addressDto: AddressDto): Promise<boolean> {
    return this.userService.UpdateAddress(addressDto);
  }

  @Post('/DeleteAddress')
  async DeleteAddress(@Body() addressDto: AddressDto): Promise<boolean> {
    return this.userService.DeleteAddress(addressDto);
  }

  @Post('/searchUser')
  async searchUser(@Body() userSearch: UserSearchDto): Promise<boolean> {
    return this.userService.searchUser(userSearch);
  }

  @Post('/deleteUser/:id')
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.userService.deleteUserById(id);
  }

  @Post('/checkEmail/:email')
  async checkEmail(@Param('email') email: string): Promise<boolean> {
    return this.userService.checkEmail(email);
  }
  
  @Post('/changePassFromAdmin/:idUser/:pass')
  async changePassFromAdmin(@Param('idUser') idUser: string,
  @Param('pass') pass: string): Promise<boolean> {
    return this.userService.changePassFromAdmin(idUser,pass);
  }
}
