import { Module, forwardRef } from "@nestjs/common";
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
import { AuthGuard } from "src/auth/auth.guard";
import { JwtService } from "@nestjs/jwt";
import { OrderService } from "src/order/order.service";
import { Order } from "src/models/order.model";
import { OrderDetails } from "src/models/orderdetails.model";
@Module({
    imports: [SequelizeModule.forFeature([Product, ProductDetails, Categories, Color, Image, Order, OrderDetails])],
    providers: [ProductService, CategoriesService, ColorService, ImageService, OrderService, AuthGuard, JwtService],
    controllers: [ProductController],
    exports: [ProductService]
})
export class ProductModule{}