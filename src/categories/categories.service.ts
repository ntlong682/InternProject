import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { Categories } from "src/models/categories.model";
import { Product } from "src/models/product.model";
import { ProductService } from "src/product/product.service";


@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Categories)
        private categoryModel: typeof Categories,
        @InjectModel(Product)
        private productModel: typeof Product,
        private sequelize: Sequelize,
        // @Inject(forwardRef(() => ProductService))
        // private productService: ProductService
    ) { }

    // @Inject(ProductService)
    // private productService: ProductService
    

    //Run 1 time
    async addCategory(): Promise<string> {
        try {
            await this.sequelize.transaction(async t => {
                const transactionHost = { transaction: t };

                await this.categoryModel.create(
                    {
                        categoryName: 'Laptop'
                    }, transactionHost,
                );

                await this.categoryModel.create(
                    {
                        categoryName: 'Tablet'
                    }, transactionHost,
                );

                await this.categoryModel.create(
                    {
                        categoryName: 'Phone'
                    }, transactionHost,
                );
            })
            return 'Create categories success!';
        } catch (error) {
            return 'Create categories failed!';
        }
    }

    async findAll(): Promise<Categories[]> {
        return this.categoryModel.findAll();
    }

    async checkCategoryId(id: number): Promise<boolean> {
        const category = this.categoryModel.findOne({
            where: {
                id: id,
            }
        })

        return category != null;
    }

    async createCategory(name: string): Promise<boolean> {
        const checkNameExist = await this.checkCategoryNameExist(name);
        if (checkNameExist != true) {
            try {
                await this.categoryModel.create({
                    categoryName: name
                });
                return true;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

    async checkCategoryNameExist(name: string): Promise<boolean> {
        const result = await this.categoryModel.findOne({
            where: {
                categoryName: {
                    [Op.iLike]: name
                }
            }
        })

        return result != null;
    }

    async deleteCategoryById(id: number): Promise<boolean> {
        const checkCategoryExist = await this.checkCategoryExistById(id);
        if (checkCategoryExist == true) {
            const checkProductExistInCategory = await this.checkProductExistByCategoryId(id);
            if (checkProductExistInCategory == false) {
                try {
                    await this.categoryModel.destroy({
                        where: {
                            id: id
                        }
                    })
                    return true; 
                } catch (error) {
                    throw error;
                }
            } 
        } 
        return false;
    }

    async checkProductExistByCategoryId(categoryId: number) : Promise<boolean> {
        const result = await this.productModel.count({
            where: {
                category_id: categoryId
            }
        })

        return result > 0

    }

    async checkCategoryExistById(id: number): Promise<boolean> {
        const result = await this.categoryModel.count({
            where: {
                id: id
            }
        })

        return result > 0;
    }
}