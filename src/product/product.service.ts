
import { Image } from 'src/models/image.model';
import { Injectable, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriesService } from "src/categories/categories.service";
import { ColorService } from "src/color/color.service";
import { Product } from "src/models/product.model";
import { ImageService } from "src/image/image.service";
import { ProductDetails } from "src/models/productdetails.model";
import { ListProductAdminDTO } from "src/dto/listProductAdmin.dto";
import { Categories } from "src/models/categories.model";
import { Op } from 'sequelize';
import { OrderService } from 'src/order/order.service';
import { UpdateProductDTO } from 'src/dto/updateProduct.dto';
// import imageToBase64 from 'image-to-base64';
import * as fs from 'fs';
import { error } from 'console';


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
        private readonly imageService: ImageService,
        private readonly orderService: OrderService
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
        colorId: number, quantity: number, product_id: number): Promise<boolean> {
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
            console.log(error);
            return false;
        }
    }


    async saveProductsImage(@UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] }, productId: number): Promise<boolean> {
        // console.log(files);
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

    async deleteLocalProductImageError(@UploadedFiles() files: { coverImage?: Express.Multer.File[], Images?: Express.Multer.File[] }) {
        files.coverImage.forEach(file => {
            this.deleteLocalFile(file.path);
        });
        files.Images.forEach(file => {
            this.deleteLocalFile(file.path);
        });
    }

    async deleteLocalFile(filePath: string) {
        fs.unlink(filePath, (err) => {
            if(err){
                throw err;
            }
        })
        
    }

    async findAllProduct(): Promise<Product[]> {
        const products = await this.productModel.findAll({
            include: [
                {
                    model: Categories
                },
                {
                    model: Image,
                    where: {
                        imgName: {
                            [Op.startsWith]: 'Cover'
                        }
                    }
                }
            ]
        });
        if (products.length != 0) {
            console.log(products); //test
            return products;
        } else {
            return null;
        }
    }

    async findProductById(productId: number): Promise<Product> {
        const product = await this.productModel.findOne({
            include: [
                {
                    model: Categories
                },
                {
                    model: Image
                }
            ], where: {
                id: productId
            }
        })
        // console.log(product);

        return product;
    }

    async findProductUpdateById(productId: number): Promise<Product> {
        const product = await this.productModel.findOne({
            include: [
                {
                    model: Categories
                },
                {
                    model: Image
                }, {
                    model: ProductDetails
                }
            ], where: {
                id: productId
            }
        })
        // console.log(product);

        return product;
    }

    async getListProductForAdmin(): Promise<ListProductAdminDTO[]> {
        const products = await this.findAllProduct();
        if (products != null) {
            let result: ListProductAdminDTO[] = [];
            products.forEach(p => {
                // const coverImg = this.imageService.findCoverImageByProductId(p.id);
                // const coverImgPath = (await coverImg).imgUrl;//here
                const newProductDTO: ListProductAdminDTO = {
                    id: p.id,
                    productName: p.name,
                    price: p.price,
                    oldPrice: p.oldPrice,
                    categoryName: p.category.categoryName,
                    coverImgPath: p.imgList[0].imgUrl
                }
                result.push(newProductDTO);
            });

            return result;
        }

        return null;
    }

    // async converImgToBase64(imgPath: string) : Promise<string> {
    //     let result: string = '';
    //     await imageToBase64(imgPath).then((result) => {
    //         result = result;
    //     }).catch((err) => {
    //         throw err;
    //     });
    //     return result;
    // }

    async getSelectedProduct(id: number): Promise<UpdateProductDTO> {
        const result = await this.findProductUpdateById(id);
        if (result != null) {
            let coverImgUrl: string;
            let imgDataList: string[] = [];
            let count = 0;
            do {
                let tempImg = result.imgList[count].imgName;
                if (tempImg.startsWith('Cover') == true) {
                    // coverImgUrl = await this.converImgToBase64(result.imgList[count].imgUrl);
                    //Dang o day, bi loi ne`
                    coverImgUrl = result.imgList[count].imgUrl;
                    break;
                } 
                count++;

            } while (count < result.imgList.length);

            count = 0;
            do {
                let tempImg = result.imgList[count].imgName;
                if (tempImg.startsWith('Cover') == false) {
                    imgDataList.push(result.imgList[count].imgUrl);
                    // imgDataList.push(await this.converImgToBase64(result.imgList[count].imgUrl));
                }
                count++;

            } while (count < result.imgList.length);

            // console.log(result);

            const selectedProduct: UpdateProductDTO = {
                id: result.id,
                name: result.name,
                price: result.price,
                oldprice: result.oldPrice,
                categoryId: result.category_id,
                cpu: result.productDetails.cpuName,
                ram: result.productDetails.ram,
                rom: result.productDetails.rom,
                screen: result.productDetails.screen,
                weight: result.productDetails.color_id,
                colorId: result.productDetails.color_id,
                quantity: result.productDetails.quantity,
                coverImg: coverImgUrl,
                imgList: imgDataList
            };
            return selectedProduct;
        }

        return null;
    }


    async deleteProduct(id: number): Promise<boolean> {
        try {
            const checkExist = this.orderService.checkProductExistInOrder(id);
            if (await checkExist == true) {
                //xoa img
                //Xoa img khoi local file
                //code here
                const result = await this.imageService.findAllImgByProductId(id);
                // console.log(result);
                result.forEach(img => {
                    this.deleteLocalFile(img.imgUrl);
                });

                await this.imageService.deleteImageByProductId(id);
                //xoa product details
                await this.productDetailsModel.destroy({
                    where: {
                        product_id: id
                    }
                })
                // Xoa product
                await this.productModel.destroy({
                    where: {
                        id: id
                    }
                })
                return true;
            } else {
                return false;
            }
            //Can check productId trong order/order detail
        } catch (error) {
            return false;
        }
    }



}