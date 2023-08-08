import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Product } from "src/models/product.model";
import { CategoriesService } from "src/categories/categories.service";
import { ColorService } from "src/color/color.service";
import { Categories } from "src/models/categories.model";
import { Color } from "src/models/color.model";
@Module({
    imports: [SequelizeModule.forFeature([Product, Categories, Color])],
    providers: [ProductService, CategoriesService, ColorService],
    controllers: [ProductController],
})
export class ProductModule{}