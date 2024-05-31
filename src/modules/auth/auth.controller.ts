/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Param, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../../dto/user.dto';
import { ResponseData } from '../../global/globalClass';
import { User } from '../../schemas/user.schema';
import { HttpMessage, HttpStatus } from '../../global/globalEnum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  async login(@Body() userDto: UserDto) {
    try {
      const accessToken = await this.authService.login(userDto);
      if (accessToken) {
        return {
          accessToken,
          message: HttpMessage.SUCCESS,
          status: HttpStatus.SUCCESS,
        };
      }
      return {
        message: 'Tài khoản hoặc mật khẩu không chính xác',
        status: 401,
      };
    } catch (error) {
      return new ResponseData<User[]>(
        null,
        HttpMessage.ERROR,
        HttpStatus.ERROR,
      );
    }
  }

  @Post('/create')
  async createUser(@Body() userDto: UserDto) {
    try {
      return await this.authService.createUser(userDto);
    } catch (error) {
      return new ResponseData<User[]>(
        null,
        HttpMessage.ERROR,
        HttpStatus.ERROR,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() userDto: UserDto): Promise<any> {
    try {
      const response = await this.authService.forgotPassword(userDto.email);
      return new ResponseData<string>(null, response.message, response.status);
    } catch (error) {
      return new ResponseData<string>(
        null,
        'Something went wrong! Try Late!',
        404,
      );
    }
  }

  @Post('verify-otp')
  async verifyOTP(@Body() body: { OTP: string }): Promise<any> {
    try {
      const response = await this.authService.verifyOTP(body.OTP);
      return new ResponseData<{ resetToken: string }>(
        { resetToken: response.data },
        response.message,
        response.status,
      );
    } catch (error) {
      return new ResponseData<string>(
        null,
        'Something went wrong! Try Late!',
        404,
      );
    }
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: { password: string },
  ) {
    try {
      const response = await this.authService.resetPassword(
        token,
        body.password,
      );
      return new ResponseData<{ jwt: string }>(
        { jwt: response.data },
        response.message,
        response.status,
      );
    } catch (error) {
      return new ResponseData<string>(
        null,
        'Something went wrong! Try Late!',
        404,
      );
    }
  }
}
