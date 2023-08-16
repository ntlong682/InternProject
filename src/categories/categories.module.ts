import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Categories } from "src/models/categories.model";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [SequelizeModule.forFeature([Categories])],
    providers: [CategoriesService, AuthGuard, JwtService],
    controllers: [CategoriesController],
})
export class CategoriesModule {    
}