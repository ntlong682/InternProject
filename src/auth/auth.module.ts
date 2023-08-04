import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/models/user.model";
import { UserService } from "src/user/user.service";

@Module({
    imports:[SequelizeModule.forFeature([User])],
    providers:[AuthService, UserService],
    controllers: [AuthController],
})
export class AuthModule{}