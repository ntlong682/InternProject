import { Controller, Get, Post, UploadedFiles, UseInterceptors, Query, Body } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { createProductDTO } from "src/dto/createProduct.dto";
import { ImageService } from "src/image/image.service";
import { ColorService } from "src/color/color.service";

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly imageService: ImageService,
        private readonly colorService: ColorService
    ) { }
    @Get('create')
    async getCategoriesAndColorList(): Promise<any> {
        return this.productService.getCategoriesAndColor();
    }

    @Post('create')
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
    async createProduct(@UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] },
        @Body() body: createProductDTO): Promise<any> {
        // console.log(files);
        // console.log(body);
        let flag = true;
        
        files.coverImage.forEach(file => {
            if (!this.imageService.checkImageNotExist(`Cover${file.originalname}`)) {
                flag = false;
            }
        });

        files.Images.forEach(file => {
            if (!this.imageService.checkImageNotExist(file.originalname)) {
                flag = false;
            }
        });

        if(!this.colorService.checkColorExist) {
            flag = false;
        }

        if (flag == true) {
            const productResult = this.productService.createProduct(body.name, body.price, body.oldprice, body.categoryId);
            if (productResult != null) {
                const saveProductImgSuccess = this.productService.saveProductsImage(files, (await productResult).id);
                if(saveProductImgSuccess) {

                    const saveProductDetailsSuccess = this.productService.createProductDetails(body.cpu, body.screen,
                        body.ram, body.rom, body.weight, body.colorId, body.quantity, (await productResult).id);
                    if(saveProductDetailsSuccess) {
                        return {
                            status : true.valueOf()
                        };
                    }
                } 
            } 
            return {
                status : false.valueOf()
            };
        } else {
            return {
                status : false.valueOf()
            };
        }
    }
}