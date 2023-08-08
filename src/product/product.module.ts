import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Product } from "src/models/product.model";
import { CategoriesService } from "src/categories/categories.service";
import { ColorService } from "src/color/color.service";
import { Categories } from "src/models/categories.model";
import { Color } from "src/models/color.model";
import { ImageService } from "src/image/image.service";
import { Image } from "src/models/image.model";
import { ProductDetails } from "src/models/productdetails.model";
@Module({
    imports: [SequelizeModule.forFeature([Product, ProductDetails, Categories, Color, Image])],
    providers: [ProductService, CategoriesService, ColorService, ImageService],
    controllers: [ProductController],
})
export class ProductModule{}