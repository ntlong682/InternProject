import { Injectable, UseInterceptors } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriesService } from "src/categories/categories.service";
import { ColorService } from "src/color/color.service";
import { Product } from "src/models/product.model";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Injectable()
export class ProductService{
    constructor(
        @InjectModel(Product)
        private productModel: typeof Product,
        private sequelize: Sequelize,
        private readonly categoriesService : CategoriesService,
        private readonly colorService : ColorService
    ){}

    async getCategoriesAndColor() : Promise<any> {
        return {
            categories: await this.categoriesService.findAll(),
            colors: await this.colorService.findAll()
        }
    }

    async createProduct(name : string, price : number, oldprice : number, category_id : number) : Promise<Product> {
        
        const checkCategoryExist = await this.categoriesService.checkCategoryId(category_id);
        let result = null;
        if(checkCategoryExist) {
            result = this.productModel.create({
                name : name,
                price : price,
                oldPrice : oldprice,
                category_id: category_id
            })
        }
        return result;
            
    }

    @UseInterceptors( FileFieldsInterceptor([
        {name: 'coverImage', maxCount: 1},
        {name: 'Images', maxCount: 5}
    ], {
        storage: diskStorage({
            destination: './files',
            filename: function (req, file, callback) {
                callback(null, file.originalname);
            }
        })
    }))
    async saveProductsImage(files :  {coverImage? : Express.Multer.File[], Images? : Express.Multer.File[]}, productId : number) {
        console.log(files);
        files.coverImage.forEach(file => {
            
        });
    }
}