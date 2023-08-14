import { Controller, Get, Post, UploadedFiles, UseInterceptors, Query, Body, UseGuards, Delete, Res } from "@nestjs/common";
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

    // async testResponeFile(@Res() res) {

    // }

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

        // files.coverImage.forEach(async file => {
        //     if ( await this.imageService.checkImageNotExist(`Cover${file.originalname}`) != true) {
        //         flag = false;
        //     }
        // });

        // files.Images.forEach(async file => {
        //     if (await this.imageService.checkImageNotExist(file.originalname) != true) {
        //         flag = false;
        //     }
        // });

        //Da gen path nen ko bi trung nua

        if (await this.colorService.checkColorExist(body.colorId) == false) {
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
    @Delete('delete')
    async deleteProduct(@Query('id') id: string): Promise<{ status, message }> {
        try {
            const productId: number = parseInt(id);

            const productExist = await this.productService.findProductById(productId);
            if (productExist != null) {
                const result = this.productService.deleteProduct(productId);
                if (await result == true) {
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
            } else {
                return {
                    status: false.valueOf(),
                    message: 'Sản phẩm không tồn tại'
                }
            }
        } catch (error) {
            return {
                status: false.valueOf(),
                message: 'Xóa sản phẩm thất bại'
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('update')
    async updateProduct(@Query('id') id: string): Promise<{status, message, data}> {
        const productId = parseInt(id);
        const result = await this.productService.getSelectedProduct(productId);
        // console.log(result);
        //Can phai load them color list vs category list
        

        if(result != null) {
            return {
                status: true.valueOf(),
                message: 'Load sản phẩm thành công',
                data: result
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Load sản phẩm thất bại',
                data: null
            }
        }
        
    }

}