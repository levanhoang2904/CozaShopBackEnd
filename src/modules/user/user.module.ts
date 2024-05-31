/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../../schemas/user.schema";
import { JwtStrategy } from "../../strategy/jwt.strategy";
import { UserAddress, UserAddressSchema } from "../../schemas/userAddress.schema";

@Module ({
    imports: [ MongooseModule.forFeature([{
        name: User.name,
        schema: UserSchema
    },
    {
        name: UserAddress.name,
        schema: UserAddressSchema
    },
])],
    controllers: [UserController],
    providers: [UserService, JwtStrategy]
})

export class UserModule {  
}
