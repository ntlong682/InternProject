import { Controller, Get, Post, UploadedFiles, UseInterceptors, Query, Body, UseGuards, Delete, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { createProductDTO } from "src/dto/createProduct.dto";
import { ImageService } from "src/image/image.service";
import { ColorService } from "src/color/color.service";
import { AuthGuard } from "src/auth/auth.guard";
import { v4 as uuidv4 } from 'uuid';
import { CategoriesService } from "src/categories/categories.service";
import { UpdateSelectedProductDTO } from "src/dto/updateSelectedProduct";
import { validate } from "class-validator";

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly imageService: ImageService,
        private readonly colorService: ColorService,
        private readonly categoriesService: CategoriesService,
    ) { }

    // imageFileFilter = (req, file, callback) => {
    //     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    //         return callback(new Error('Only image files are allowed!'), false);
    //     }
    //     callback(null, true);
    // };

    @UseGuards(AuthGuard)
    @Get('create')
    async getCategoriesAndColorList(): Promise<any> {
        return this.productService.getCategoriesAndColor();
    }

    // async testResponeFile(@Res() res) {

    // }

    @UseGuards(AuthGuard)
    @Post('create')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'coverImage', maxCount: 1 },
        { name: 'Images', maxCount: 5 }
    ], {
        storage: diskStorage({
            destination: './files',
            filename: function (req, file, callback) {
                callback(null, uuidv4() + ".png");
            }
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Only image files are allowed!'), false);
            }
            callback(null, true);
        }
    }))
    async createProduct(@Body() body: createProductDTO, @UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] }): Promise<{ status }> {
        // console.log(files);
        // console.log(body);
        let flag = true;
        if (files.coverImage == null || files.coverImage.length == 0) {
            flag = false;
        }
        if (files.Images == null || files.coverImage.length == 0) {
            flag = false;
        }
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
            } else {
                await this.productService.deleteLocalProductImageError(files);
                return {
                    status: false.valueOf()
                };
            }
        } else {
            await this.productService.deleteLocalProductImageError(files);
            return {
                status: false.valueOf()
            };
        }
    }

    @UseGuards(AuthGuard)
    @Get('list-product')
    async getListProduct(): Promise<any> {
        const result = await this.productService.getListProductForAdmin();
        // console.log(result);
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
    async getUpdateProduct(@Query('id') id: string): Promise<{ status, message, data, colors, categories }> {
        const productId = parseInt(id);
        const result = await this.productService.getSelectedProduct(productId);
        // console.log(result);
        //Can phai load them color list vs category list
        const colorList = await this.colorService.findAll();
        const categories = await this.categoriesService.findAll();
        if (result != null) {
            return {
                status: true.valueOf(),
                message: 'Load sản phẩm thành công',
                colors: colorList,
                categories: categories,
                data: result
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Load sản phẩm thất bại',
                colors: null,
                categories: null,
                data: null
            }
        }

    }

    @UseGuards(AuthGuard)
    @Post('update')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'coverImage', maxCount: 1 },
            { name: 'Images', maxCount: 5 }
        ], {
            storage: diskStorage({
                destination: './files',
                filename: function (req, file, callback) {
                    callback(null, uuidv4() + ".png");
                }
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
                }
                callback(null, true);
            }
        })
    )
    // @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async updateProduct(@UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] },
        @Body() body: UpdateSelectedProductDTO): Promise<{ status, message }> {
        // const validationError = await validate(body);
        // await this.saveFileToLocal(files);    
        let flag = true;
        if (files.coverImage == null || files.coverImage.length == 0) {
            flag = false;
        }
        if (files.Images == null || files.coverImage.length == 0) {
            flag = false;
        }
        if (await this.colorService.checkColorExist(body.colorId) == false
            || await this.categoriesService.checkCategoryId(body.categoryId) == false) {
            flag = false;
        }
        if (flag == true) {
            const product = await this.productService.findProductById(body.id);
            // console.log(product);
            const imgList = await this.imageService.findAllImgByProductId(body.id);
            // console.log(imgList);

            await this.imageService.deleteImageByProductId(body.id);

            const saveProductImgSuccess = await this.productService.saveProductsImage(files, body.id);
            if (product != null && saveProductImgSuccess == true) {
                const update = await this.productService.updateProduct(body);
                if (update != true) {
                    flag = false;
                } else {
                    imgList.forEach(async img => {
                        await this.productService.deleteLocalFile(img.imgUrl);
                    });
                }
            } else {
                flag = false;
            }
            if (flag == false) {
                imgList.forEach(async img => {
                    await this.imageService.addImage(img.imgName, img.imgUrl, img.product_id);
                });
            }
        }
        // console.log(flag);


        if (flag == true) {
            return {
                status: true.valueOf(),
                message: 'Update sản phẩm thành công'
            }
        } else {
            await this.productService.deleteLocalProductImageError(files);
            return {
                status: false.valueOf(),
                message: 'Update sản phẩm thất bại'
            }
        }
    }


    @Get('home')
    async getListProductHomePage(): Promise<{ status, message, data }> {


        return {
            status: '',
            message: '',
            data: ''
        }
    }

    // @UseInterceptors(FileFieldsInterceptor([
    //     { name: 'coverImage', maxCount: 1 },
    //     { name: 'Images', maxCount: 5 }
    // ], {
    //     storage: diskStorage({
    //         destination: './files',
    //         filename: function (req, file, callback) {
    //             callback(null, uuidv4() + ".png");
    //         }
    //     }),
    //     fileFilter: (req, file, callback) => {
    //         if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    //             return callback(new Error('Only image files are allowed!'), false);
    //         }
    //         callback(null, true);
    //     }
    // }))
    // async saveFileToLocal(@UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] }) {

    // }


    // @Get('testfile')
    // async testResponeFile(@Res() res: Response) {
    //     let flag = true;
    //     const file = fs.readFile();
    //     // const file = fs.readFile('files\a060f669-fbd9-4ba2-a18e-9d8cd17034ec.png', (err) => {
    //     //     if(err) {
    //     //         flag = false;
    //     //     }
    //     // })

    //     console.log(file);

    //     if(flag == true) {
    //         res.contentType('png');
    //         res.send(file);
    //     } else {
    //         return {
    //             data: false.valueOf()
    //         }
    //     }
    // }

}