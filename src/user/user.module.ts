import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/models/user.model";

@Module({
    imports:[SequelizeModule.forFeature([User])],
    providers:[],
    controllers: [],
})
export class UserModule {

}