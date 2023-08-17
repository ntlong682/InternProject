import { Module, forwardRef } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Categories } from "src/models/categories.model";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtService } from "@nestjs/jwt";
import { Product } from "src/models/product.model";


@Module({
    imports: [SequelizeModule.forFeature([Categories, Product])],
    providers: [CategoriesService, AuthGuard, JwtService],
    controllers: [CategoriesController],
    exports: [CategoriesService]
})
export class CategoriesModule {    
}