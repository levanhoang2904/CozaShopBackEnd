/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../schemas/user.schema';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@InjectModel(User.name) private usermodel: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SCERET,
    });
  }

  async validate(payload: { email: string }) {
    try {
      const user = await this.usermodel.findOne({ email: payload.email });

      const data = {
        _id: user._id,
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        date: user.date,
        password: user.password,
        role: user.role,
      };

      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
