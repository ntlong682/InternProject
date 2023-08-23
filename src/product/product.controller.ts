import { Controller, Get, Post, UploadedFiles, Put, UseInterceptors, Query, Body, UseGuards, Delete, Res, UsePipes, ValidationPipe } from "@nestjs/common";
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
import { AddProductMetaData } from "src/dto/addProductMetaData.dto";
import { Sequelize } from "sequelize-typescript";

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly imageService: ImageService,
        private readonly colorService: ColorService,
        private readonly categoriesService: CategoriesService,
        private sequelize: Sequelize
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
        if (files.Images == null || files.Images.length == 0) {
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
 
        let flag = true;
        let messageError = "";

        //Check xem nếu người dùng xóa cover img thì phải add cover img mới
        if (files.coverImage == null && body.deletedCoverImg.length > 0) {
            flag = false;
            messageError += 'If you delete cover image, you must add a new one. ';
        }

        //Check xem nếu người dùng xóa hết ảnh của sản phẩm thì phải add ít nhất 1 ảnh mới
        const deletedImgList: string[] = body.deletedImgUrl.split("||");
        const countProductImg = await this.imageService.countImgInProduct(body.id);
        if (files.Images == null && deletedImgList.length - 1 == countProductImg) {
            flag = false;
            messageError += 'If you delete all image, you must add atlease a new one. ';
        }

        //Check category tồn tại hay ko
        if (await this.categoriesService.checkCategoryId(body.categoryId) == false) {
            flag = false;
        }
        if (flag == true) {
            //Dùng transaction để rollback nếu có lỗi
            const transaction = await this.sequelize.transaction();
            try {
                //Check product tồn tại hay ko và lưu ảnh của product vào db thành công hay ko
                const product = await this.productService.findProductById(body.id);
                const saveProductImgSuccess = await this.productService.saveProductsImage(files, body.id);
                if (product != null && saveProductImgSuccess == true) {
                    //Update product
                    const update = await this.productService.updateProduct(body);
                    if (update != true) {
                        flag = false;
                        messageError += "Cập nhật thất bại. ";
                        throw messageError;
                    } else {
                        //Delete selected image by user.
                        await this.imageService.deleteImageByUrl(body.deletedCoverImg);
                        await this.productService.deleteLocalFile(body.deletedCoverImg);

                        for (const url of Object.values(deletedImgList)) {
                            await this.imageService.deleteImageByUrl(url);
                            await this.productService.deleteLocalFile(url);
                        }
                        
                        transaction.commit();
                    }
                } else {
                    flag = false;
                    messageError += "Cập nhật thất bại. ";
                    throw messageError;
                }
            } catch (error) {
                flag = false;
                console.log("Transaction rollback: " + error);
                transaction.rollback();
            }
        }
        if (flag == true) {
            return {
                status: true.valueOf(),
                message: 'Update sản phẩm thành công'
            }
        } else {
            await this.productService.deleteLocalProductImageError(files);
            return {
                status: false.valueOf(),
                message: messageError
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('productdetails')
    async getProductDetails(@Query('id') productId: number): Promise<{ status, message, data }> {
        const result = await this.productService.getProductDetailsByProductId(+productId);
        if (result != null) {
            return {
                status: true.valueOf(),
                message: 'Xem chi tiết sản phẩm thành công',
                data: result
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Xem chi tiết sản phẩm thất bại',
                data: null
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('add-product-metadata')
    async getAddProductMetadata(): Promise<{ status, message, data }> {
        const result = await this.productService.getDataForAddMetaData();
        if (result != null && result.length > 0) {
            return {
                status: true.valueOf(),
                message: 'Load thông tin thành công',
                data: result
            }
        } else {
            return {
                status: true.valueOf(),
                message: 'Load thông tin thành công',
                data: null
            }
        }
    }

    @UseGuards(AuthGuard)
    @Post('add-product-metadata')
    async addProductMetadata(@Body() body: AddProductMetaData): Promise<{ status, message }> {
        const result = await this.productService.addMetaDataForProduct(body);
        return result;
    }

    @UseGuards(AuthGuard)
    @Delete('delete-product-metadata')
    async deleteProductMetaData(@Query('productId') productId: number, @Query('productDetailsId') productDetailsId: number):
        Promise<{ status, message }> {
        const result = await this.productService.deleteMetaDataForProduct(productId, productDetailsId);

        if (result == true) {
            return {
                status: result.valueOf(),
                message: 'Xóa thành công'
            }
        } else {
            return {
                status: result.valueOf(),
                message: 'Xóa thất bại'
            }
        }

    }

    @UseGuards(AuthGuard)
    @Get('update-product-metadata')
    async getUpdateProductMetaData(@Query('id') id: number): Promise<{ status, message, data }> {
        const result = await this.productService.getSelectedProductMetadata(id);

        if (result != null) {
            return {
                status: true.valueOf(),
                message: 'Load data thành công',
                data: result
            }
        } else {
            return {
                status: true.valueOf(),
                message: 'Load data thất bại',
                data: null
            }
        }
    }

    @UseGuards(AuthGuard)
    @Put('update-product-metadata')
    async updateProductMetaData(@Query('productDetailsId') productDetailsId: number,
        @Query('colorId') colorId: number, @Query('quantity') quantity: number)
        : Promise<{ status, message }> {
        const result = await this.productService.updateMetaDataForProduct(productDetailsId,
            colorId, quantity);
        if (result == true) {
            return {
                status: true.valueOf(),
                message: 'Cập nhật thông tin chi tiết sản phẩm thành công'
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Cập nhật thông tin chi tiết sản phẩm thất bại'
            }
        }
    }

    @Post('search')
    async searchProduct(@Query('searchString') searchStr: string) {
        const result = await this.productService.searchProductByName(searchStr);

        return result;
    }


    @Get('home')
    async getListProductHomePage(): Promise<{ status, message, data }> {
        const data = await this.productService.getProductsForHomePage();
        // console.log(data);
        return {
            status: true.valueOf(),
            message: 'Lấy sản phẩm thành công',
            data: data
        }
    }
}