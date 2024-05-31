/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as otpGenerator from 'otp-generator';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

import { User } from '../../schemas/user.schema';
import { HttpStatus } from '../../global/globalEnum';
import { UserDto } from '../../dto/user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hashSync(password, salt);
  }

  async comparePassword(rawPass: string, hash: string): Promise<boolean> {
    return await bcrypt.compareSync(rawPass, hash);
  }

  async login(userDto: UserDto): Promise<string> {
    const data: any = await this.userModel.findOne({
      email: userDto.email,
    });

    if (data) {
      const matched: boolean = await this.comparePassword(
        userDto.password,
        data.password,
      );
      if (matched) {
        const payload = {
          id: data._id,
          email: data.email,
          phone: data.phone,
          name: data.name,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
          secret: process.env.JWT_SCERET,
          expiresIn: `${6 * 30 * 24 * 60 * 60}s`, //"6 months"
        });

        return accessToken;
      }
    }
  }

  async createUser(userDto: UserDto): Promise<boolean> {
    try {
      const isEmailExists = await this.userModel.findOne({
        email: userDto.email,
      });
      if (isEmailExists) {
        return false;
      } else {
        const salt = await bcrypt.genSalt();
        userDto.password = await this.hashPassword(userDto.password, salt);
        userDto.role = 'user';
        await this.userModel.create(userDto);
        return true;
      }
    } catch (error) {
      console.error('Lỗi khi thêm người dùng:', error);
      return false;
    }
  }

  async createOTP(): Promise<string> {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    return otp;
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        return {
          status: HttpStatus.ERROR,
          message: 'Email không tồn tại trong hệ thống!!!',
        };
      }

      const otp = await this.createOTP();

      user.OTP = otp;
      const expiresIn = new Date(Date.now() + 15 * 6 * 1000);
      user.resetExpires = expiresIn;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: '"ShopTT 👌" <admin@gmail.com>',
        to: email,
        subject: 'Quên mật khẩu ✔',
        text: 'Xác nhận OTP của bạn',
        html: `<div>
                <h3><strong>Xác nhận OTP</strong></h3> 
                <p>
                  Mã OTP của bạn <strong>(${otp})</strong> sẽ hết hạn trong <strong>15 phút!
                </p>
              </div>`,
      });

      if (info) {
        return {
          status: HttpStatus.SUCCESS,
          message: 'Gửi OTP thành công! Vui lòng xác nhận OTP!',
        };
      } else {
        user.OTP = undefined;
        user.resetExpires = undefined;
        user.save();
      }
    } catch (error) {
      return {
        status: HttpStatus.ERROR,
        message: 'Không thể gửi OTP! Thử lại sau!!!',
      };
    }
  }

  async verifyOTP(OTP: string): Promise<any> {
    try {
      const currentDateTime = new Date();
      const user = await this.userModel.findOne({
        OTP: OTP,
        resetExpires: { $gt: currentDateTime },
      });

      if (!user) {
        return {
          status: HttpStatus.ERROR,
          message: 'OTP không hợp lệ hoặc đã hết hạn!',
        };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      await user.save();

      return {
        status: HttpStatus.SUCCESS,
        message: 'Xác nhận OTP thành công! Đã tạo mới token reset mật khẩu!',
        data: resetToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Có lỗi xảy ra khi xác nhận OTP!',
      };
    }
  }

  async resetPassword(token: string, password: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({
        resetToken: token,
      });

      if (!user) {
        return {
          status: HttpStatus.ERROR,
          message: 'Token không hợp lệ! Vui lòng thử lại sau!',
        };
      }

      const salt = await bcrypt.genSalt();
      user.password = await this.hashPassword(password, salt);
      user.OTP = undefined;
      user.resetExpires = undefined;
      user.resetToken = undefined;
      await user.save();

      const payload = {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SCERET,
        expiresIn: '10m',
      });

      return {
        status: HttpStatus.SUCCESS,
        message: 'Đăng nhập thành công!',
        data: accessToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.ERROR,
        message: 'Có lỗi xảy ra! Vui lòng thử lại!!!',
      };
    }
  }
}
