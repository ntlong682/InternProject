import { Controller, Get, Post, UploadedFiles, UseInterceptors, Query, Body } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { createProductDTO } from "src/dto/createProduct.dto";

@Controller('product')
export class ProductController{
    constructor(
        private readonly productService : ProductService,
        
    ){}
    @Get('create')
    async getCategoriesAndColorList() : Promise<any>{
        return this.productService.getCategoriesAndColor();
    }

    @Post('create')
    @UseInterceptors( FileFieldsInterceptor([
        {name: 'coverImage', maxCount: 1},
        {name: 'Images', maxCount: 5}
    ]))
    async createProduct(@UploadedFiles() files : {coverImage? : Express.Multer.File[], Images? : Express.Multer.File[]},
    @Body() body : createProductDTO) : Promise<any> {
        console.log(files);
        console.log(body);
        const productResult = this.productService.createProduct(body.name, body.price, body.oldprice, body.categoryId);
        if(productResult != null) {
            // this.productService.saveProductsImage(files, (await productResult).id);
            return true;
        } else {
            return false;
        }
    }
}