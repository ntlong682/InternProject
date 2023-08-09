import { Controller, Get, Post, UploadedFiles, UseInterceptors, Query, Body, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { createProductDTO } from "src/dto/createProduct.dto";
import { ImageService } from "src/image/image.service";
import { ColorService } from "src/color/color.service";
import { AuthGuard } from "src/auth/auth.guard";
import { v4 as uuidv4 } from 'uuid';

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly imageService: ImageService,
        private readonly colorService: ColorService
    ) { }

    imageFileFilter = (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
    };

    @UseGuards(AuthGuard)
    @Get('create')
    async getCategoriesAndColorList(): Promise<any> {
        return this.productService.getCategoriesAndColor();
    }

    @UseGuards(AuthGuard)
    @Post('create')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'coverImage', maxCount: 1 },
        { name: 'Images', maxCount: 5 }
    ], {
        storage: diskStorage({
            destination: './files',
            filename: function (req, file, callback) {
                callback(null, uuidv4() + ".png");
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

        if (!this.colorService.checkColorExist) {
            flag = false;
        }

        if (flag == true) {
            const productResult = await this.productService.createProduct(body.name, body.price, body.oldprice, body.categoryId);
            if (productResult != null) {
                const saveProductImgSuccess = await this.productService.saveProductsImage(files, productResult.id);
                if (saveProductImgSuccess) {

                    const saveProductDetailsSuccess = await this.productService.createProductDetails(body.cpu, body.screen,
                        body.ram, body.rom, body.weight, body.colorId, body.quantity, productResult.id);
                    if (saveProductDetailsSuccess) {
                        return {
                            status: true.valueOf()
                        };
                    }
                }
            }
            return {
                status: false.valueOf()
            };
        } else {
            return {
                status: false.valueOf()
            };
        }
    }

    @UseGuards(AuthGuard)
    @Get('list-product')
    async getListProduct(): Promise<any> {
        const result = await this.productService.getListProductForAdmin();
        console.log(result);
        if (result != null) {
            return {
                status: true.valueOf(),
                message: 'Tìm sản phẩm thành công',
                data: result
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Không có sản phẩm nào'
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('delete')
    async deleteProduct(@Query('id') id: number): Promise<any> {
        const result = this.productService.deleteProduct(id);
        if(result) {
            return {
                status: true.valueOf(),
                message: 'Xóa sản phẩm thành công'
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Xóa sản phẩm thất bại'
            }
        }
        
        
    }

}