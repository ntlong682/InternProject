import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/models/user.model";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/auth.guard";

@Module({
    imports:[SequelizeModule.forFeature([User])],
    providers:[UserService, AuthGuard],
    controllers: [UserController],
})
export class UserModule {

}