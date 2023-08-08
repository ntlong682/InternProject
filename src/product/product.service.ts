import { Injectable, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriesService } from "src/categories/categories.service";
import { ColorService } from "src/color/color.service";
import { Product } from "src/models/product.model";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ImageService } from "src/image/image.service";
import { ProductDetails } from "src/models/productdetails.model";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product)
        private productModel: typeof Product,
        @InjectModel(ProductDetails)
        private productDetailsModel: typeof ProductDetails,
        private sequelize: Sequelize,
        private readonly categoriesService: CategoriesService,
        private readonly colorService: ColorService,
        private readonly imageService: ImageService
    ) { }

    async getCategoriesAndColor(): Promise<any> {
        return {
            categories: await this.categoriesService.findAll(),
            colors: await this.colorService.findAll()
        }
    }

    async createProduct(name: string, price: number, oldprice: number, category_id: number): Promise<Product> {

        const checkCategoryExist = await this.categoriesService.checkCategoryId(category_id);
        let result = null;
        if (checkCategoryExist) {
            result = this.productModel.create({
                name: name,
                price: price,
                oldPrice: oldprice,
                category_id: category_id
            })
        }
        return result;

    }

    async createProductDetails(cpuName: string, screen: number, ram: number, rom: number, weight: number,
        colorId: number, quantity: number, product_id: number) : Promise<boolean> {
        try {
            const result = await this.productDetailsModel.create({
                cpuName: cpuName,
                product_id: product_id,
                screen: screen,
                ram: ram,
                rom: rom,
                weight: weight,
                color_id: colorId,
                quantity: quantity,
            });
            console.log(result);
            return true;
        } catch (error) {
            return false;
        }
    }


    async saveProductsImage(@UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] }, productId: number): Promise<boolean> {
        console.log(files);
        let flag = true;
        files.coverImage.forEach(file => {
            const imgPath = file.path;
            console.log(file.originalname);
            const imgName = `Cover${file.originalname}`;
            if (!this.imageService.addImage(imgName, imgPath, productId)) {
                flag = false;
            }
        });
        files.Images.forEach(file => {
            const imgPath = file.path;
            const imgName = file.originalname;
            if (!this.imageService.addImage(imgName, imgPath, productId)) {
                flag = false;
            }
        });
        if (flag == true) {
            return true;
        } else {
            return false;
        }
    }
}