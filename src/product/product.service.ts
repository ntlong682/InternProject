import { Image } from 'src/models/image.model';
import { Injectable, UseInterceptors, UploadedFiles, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriesService } from "src/categories/categories.service";
import { ColorService } from "src/color/color.service";
import { Product } from "src/models/product.model";
import { ImageService } from "src/image/image.service";
import { ProductDetails } from "src/models/productdetails.model";
import { ListProductAdminDTO } from "src/dto/listProductAdmin.dto";
import { Categories } from "src/models/categories.model";
import { Op, where } from 'sequelize';
import { OrderService } from 'src/order/order.service';
import { GetUpdateProductDTO } from 'src/dto/updateProduct.dto';
// import imageToBase64 from 'image-to-base64';
import * as fs from 'fs';
import { error } from 'console';
import { UpdateSelectedProductDTO } from 'src/dto/updateSelectedProduct';
import { HomeProductDTO } from 'src/dto/homeProduct.dto';
import { ViewProductDetailDTO } from 'src/dto/viewProductDetail.dto';
import { ProductMetaDataDTO } from 'src/dto/productMetadata.dto';
import { Color } from 'src/models/color.model';
import { AddProductMetaData } from 'src/dto/addProductMetaData.dto';


@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product)
        private productModel: typeof Product,
        @InjectModel(ProductDetails)
        private productDetailsModel: typeof ProductDetails,
        // private sequelize: Sequelize,
        // @Inject(forwardRef(() => CategoriesService))
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
        if (files.coverImage != null && files.coverImage.length > 0) {
            files.coverImage.forEach(file => {
                this.deleteLocalFile(file.path);
            });
        }
        if (files.Images != null && files.Images.length > 0) {
            files.Images.forEach(file => {
                this.deleteLocalFile(file.path);
            });
        }

    }

    async deleteLocalFile(filePath: string) {
        fs.unlink(filePath, (err) => {
            if (err) {
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
                },
                {
                    model: ProductDetails
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

            for (const p of Object.values(products)) {
                // const color = await this.colorService.findColorById(p.productDetails.color_id);
                const productDetails = await this.productDetailsModel.findAll({
                    where: {
                        product_id: p.id
                    }
                })
                let totalQuantity = 0

                for (const pd of Object.values(productDetails)) {
                    totalQuantity += pd.quantity;
                }

                const newProductDTO: ListProductAdminDTO = {
                    id: p.id,
                    productName: p.name,
                    price: p.price,
                    // color: color.name,
                    quantity: totalQuantity,
                    categoryName: p.category.categoryName,
                    coverImgPath: p.imgList[0].imgUrl
                }
                result.push(newProductDTO);
            }
            console.log('Print Result: ');
            console.log(result);
            return result;
        }

        return null;
    }

    async getSelectedProduct(id: number): Promise<GetUpdateProductDTO> {
        const result = await this.findProductUpdateById(id);
        if (result != null) {
            let coverImgUrl: string;
            let imgDataList: string[] = [];
            let count = 0;
            do {
                let tempImg = result.imgList[count].imgName;
                if (tempImg.startsWith('Cover') == true) {
                    // coverImgUrl = await this.converImgToBase64(result.imgList[count].imgUrl);
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


            //Fix lai update
            const selectedProduct: GetUpdateProductDTO = {
                id: result.id,
                name: result.name,
                price: result.price,
                oldprice: result.oldPrice,
                categoryId: result.category_id,
                cpu: result.productDetails[0].cpuName,
                ram: result.productDetails[0].ram,
                rom: result.productDetails[0].rom,
                screen: result.productDetails[0].screen,
                weight: result.productDetails[0].color_id,
                // colorId: result.productDetails[0].color_id, //sau bo color di
                // quantity: result.productDetails[0].quantity, // bo quantity di
                coverImg: coverImgUrl,
                imgList: imgDataList
            };
            return selectedProduct;
        }

        return null;
    }

    async updateProduct(updateDTO: UpdateSelectedProductDTO): Promise<boolean> {
        try {
            await this.productModel.update({
                name: updateDTO.name,
                price: updateDTO.price,
                oldPrice: updateDTO.oldprice,
                category_id: updateDTO.categoryId
            }, {
                where: {
                    id: updateDTO.id
                }
            })

            await this.productDetailsModel.update({
                cpuName: updateDTO.cpu,
                screen: updateDTO.screen,
                ram: updateDTO.ram,
                rom: updateDTO.rom,
                weight: updateDTO.weight,
                // color_id: updateDTO.colorId, //sau bo color di
                // quantity: updateDTO.quantity //bo ca quantity nua, tach ra 1 cai update rieng
            }, {
                where: {
                    product_id: updateDTO.id
                }
            })

            return true;
        } catch (error) {
            return false;
        }
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

    async findAllProductByCategory(categoryId: number): Promise<Product[]> {
        let result: Product[] = [];
        result = await this.productModel.findAll({
            include: [
                {
                    model: ProductDetails,
                    where: {
                        quantity: {
                            [Op.gt]: 0
                        }
                    }
                }, {
                    model: Image,
                    where: {
                        imgName: {
                            [Op.startsWith]: 'Cover'
                        }
                    }
                }], where: {
                    category_id: categoryId
                }
        })

        return result;
    }

    async findAllAvaiableProduct(): Promise<Product[]> {
        let result: Product[] = [];
        result = await this.productModel.findAll({
            include: [
                {
                    model: ProductDetails,
                    where: {
                        quantity: {
                            [Op.gt]: 0
                        }
                    }
                }, {
                    model: Image,
                    where: {
                        imgName: {
                            [Op.startsWith]: 'Cover'
                        }
                    }
                }]
        })

        return result;
    }


    //Fix lai sau, fix update Product truoc
    async getProductsForHomePage(): Promise<any> {

        const allProducts = await this.findAllAvaiableProduct();
        let products: HomeProductDTO[] = [];
        for (const p of Object.values(allProducts)) {
            let temp: HomeProductDTO = {
                id: p.id,
                coverImg: p.imgList[0].imgUrl,
                price: p.price,
                oldPrice: p.oldPrice,
                cpu: p.productDetails[0].cpuName,
                screen: p.productDetails[0].screen,
                ram: p.productDetails[0].ram,
                rom: p.productDetails[0].rom,
                weight: p.productDetails[0].weight
            }
            products.push(temp);
        }

        const laptopsProduct = await this.findAllProductByCategory(1);
        let laptops: HomeProductDTO[] = [];
        for (const p of Object.values(laptopsProduct)) {
            let temp: HomeProductDTO = {
                id: p.id,
                coverImg: p.imgList[0].imgUrl,
                price: p.price,
                oldPrice: p.oldPrice,
                cpu: p.productDetails[0].cpuName,
                screen: p.productDetails[0].screen,
                ram: p.productDetails[0].ram,
                rom: p.productDetails[0].rom,
                weight: p.productDetails[0].weight
            }
            laptops.push(temp);
        }

        const tabletsProduct = await this.findAllProductByCategory(2);
        let tablets: HomeProductDTO[] = [];
        for (const p of Object.values(tabletsProduct)) {
            let temp: HomeProductDTO = {
                id: p.id,
                coverImg: p.imgList[0].imgUrl,
                price: p.price,
                oldPrice: p.oldPrice,
                cpu: p.productDetails[0].cpuName,
                screen: p.productDetails[0].screen,
                ram: p.productDetails[0].ram,
                rom: p.productDetails[0].rom,
                weight: p.productDetails[0].weight
            }
            tablets.push(temp);
        }

        const phonesProduct = await this.findAllProductByCategory(3);
        let phones: HomeProductDTO[] = [];
        for (const p of Object.values(phonesProduct)) {
            let temp: HomeProductDTO = {
                id: p.id,
                coverImg: p.imgList[0].imgUrl,
                price: p.price,
                oldPrice: p.oldPrice,
                cpu: p.productDetails[0].cpuName,
                screen: p.productDetails[0].screen,
                ram: p.productDetails[0].ram,
                rom: p.productDetails[0].rom,
                weight: p.productDetails[0].weight
            }
            phones.push(temp);
        }

        return {
            products: products,
            laptops: laptops,
            tablets: tablets,
            phones: phones
        }
    }

    async checkProductExistByCategoryId(categoryId: number): Promise<boolean> {
        const result = await this.productModel.count({
            where: {
                category_id: categoryId
            }
        })

        return result > 0

    }

    async findProductDataById(productId: number): Promise<Product> {
        const product = await this.productModel.findOne({
            include: [
                {
                    model: Categories
                },
                {
                    model: Image
                },
                {
                    model: ProductDetails,
                    include: [Color]
                }
            ], where: {
                id: productId
            }
        })
        // console.log(product);

        return product;
    }


    async getProductDetailsByProductId(productId: number): Promise<ViewProductDetailDTO> {
        const product = await this.findProductDataById(productId);
        if (product != null) {
            let metaDatas: ProductMetaDataDTO[] = [];
            let totalQuantity = 0
            for (const pd of Object.values(product.productDetails)) {
                let metaData: ProductMetaDataDTO = {
                    productDetailId: pd.id,
                    colorId: pd.color_id,
                    colorName: pd.color.name,
                    quantity: pd.quantity
                }
                totalQuantity += pd.quantity;
                metaDatas.push(metaData);
            }
            let coverImg: string;
            let imgList: string[] = [];
            for (const img of Object.values(product.imgList)) {
                if (img.imgName.startsWith('Cover') == true) {
                    coverImg = img.imgUrl;
                } else {
                    imgList.push(img.imgUrl);
                }
            }

            let productDetailDTO: ViewProductDetailDTO = {
                id: product.id,
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice,
                categoryName: product.category.categoryName,
                cpuName: product.productDetails[0].cpuName,
                screen: product.productDetails[0].screen,
                ram: product.productDetails[0].ram,
                rom: product.productDetails[0].rom,
                weight: product.productDetails[0].weight,
                totalQuantity: totalQuantity,
                coverImg: coverImg,
                imagesList: imgList,
                metaData: metaDatas
            }


            return productDetailDTO;
        } else {
            return null;
        }

    }

    async getDataForAddMetaData(): Promise<Color[]> {
        return this.colorService.findAll();
    }

    // async updateProductDetail(product: Product) {

    // }

    async addMetaDataForProduct(data: AddProductMetaData): Promise<any> {
        const product = await this.findProductDataById(data.id);
        if (product != null) {
            const checkColor = await this.colorService.checkColorExist(data.color);
            if (checkColor == true) {
                const flag = await this.createProductDetails(product.productDetails[0].cpuName,
                    product.productDetails[0].screen,
                    product.productDetails[0].ram,
                    product.productDetails[0].rom,
                    product.productDetails[0].weight,
                    data.color,
                    data.quantity,
                    product.id);
                if (flag == true) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }

}