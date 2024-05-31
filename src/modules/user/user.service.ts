/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { Server } from 'socket.io';
import { AddressDto, UserDto, UserSearchDto } from '../../dto/user.dto';
import { UserAddress } from '../../schemas/userAddress.schema';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private usermodel: Model<User>,
    @InjectModel(UserAddress.name) private userAddress: Model<UserAddress>,
    private jwtService: JwtService,
  ) {}
  async getUserByid(id: string) {
    return await this.usermodel.findById(id);
  }

  async getAllUser(): Promise<any> {
    return await this.usermodel.find();
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.usermodel.findByIdAndDelete(id);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async updateProfile(userDto: UserDto): Promise<boolean> {
    try {
      const fieldsToUpdate: Partial<User> = {};
      // Chỉ cập nhật các trường cần thiết
      const user: any = await this.usermodel.findById(userDto._id);
      const matched = await bcrypt.compareSync(userDto.oldPass, user.password);
      if (matched === false) return false;

      if (userDto.email) fieldsToUpdate.email = userDto.email;
      if (userDto.phone) fieldsToUpdate.phone = userDto.phone;
      if (userDto.name) fieldsToUpdate.name = userDto.name;
      if (userDto.date) fieldsToUpdate.date = new Date(userDto.date);
      const salt = await bcrypt.genSalt();
      if (userDto.password)
        fieldsToUpdate.password = bcrypt.hashSync(userDto.password, salt);
      if (userDto.role) fieldsToUpdate.role = userDto.role;
      // Cập nhật người dùng dựa trên ID và chỉ cập nhật các trường cần thiết
      await this.usermodel.findOneAndUpdate(
        { _id: userDto._id },
        fieldsToUpdate,
      );
      return true; // Trả về true nếu cập nhật thành công
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false; // Trả về false nếu có lỗi xảy ra
    }
  }

  async getUserAndAddress(userId: string): Promise<any> {
    return await this.usermodel
      .findById(userId)
      .populate({ path: 'addresses' });
  }

  async AddAddressToUser(addressDto: AddressDto): Promise<boolean> {
    const result = await this.userAddress.insertMany(addressDto);
    const addressId = result[0]._id;
    if (result) {
      await this.usermodel.findByIdAndUpdate(addressDto.idUser, {
        $push: { addresses: addressId },
      });
      return true;
    }
    return false;
  }

  async UpdateAddress(addressDto: AddressDto): Promise<boolean> {
    await this.userAddress.findOneAndUpdate(
      { _id: addressDto.idAddress },
      addressDto,
    );
    return true;
  }

  async DeleteAddress(addressDto: AddressDto): Promise<boolean> {
    await this.userAddress.findOneAndDelete({ _id: addressDto.idAddress });
    await this.usermodel.findByIdAndUpdate(addressDto.idUser, {
      $pull: { addresses: addressDto.idAddress },
    });
    return true;
  }

  async searchUser(userSearch: UserSearchDto): Promise<any> {
    const { page = 1, pageSize = 10, searchValue } = userSearch;

    // Định nghĩa các điều kiện tìm kiếm
    const conditions: any = {};
    if (searchValue) {
      conditions.$or = [
        { email: { $regex: searchValue, $options: 'i' } },
        { phone: searchValue },
      ];
    }
    const totalCount = await this.usermodel.countDocuments(conditions);
    const pageCount = Math.ceil(totalCount / pageSize);
    const users = await this.usermodel
      .find(conditions)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return { pageCount: pageCount, data: users };
  }

  async checkEmail(email: string): Promise<boolean> {
    if (await this.usermodel.findOne({ email: email })) return true;
    else return false;
  }

  async changePassFromAdmin(idUser: string, pass: string): Promise<boolean> {
    if (await this.usermodel.findByIdAndUpdate(idUser, { password: pass }))
      return true;
    else return false;
  }
}
