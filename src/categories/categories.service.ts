import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { Categories } from "src/models/categories.model";


@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Categories)
        private categoryModel: typeof Categories,
        private sequelize: Sequelize
    ) {}


    //Run 1 time
    async addCategory() : Promise<string> {
        try {
            await this.sequelize.transaction(async t => {
                const transactionHost = {transaction: t};

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
        } catch(error) {
            return 'Create categories failed!';
        }
    }

    async findAll() : Promise<Categories[]> {
        return this.categoryModel.findAll();
    }

    async checkCategoryId(id : number) : Promise<boolean> {
        const category = this.categoryModel.findOne({
            where: {
                id : id,
            }
        })

        return category != null;
    }

    async createCategory(name: string) : Promise<boolean> {
        const checkNameExist = await this.checkCategoryNameExist(name);
        if(checkNameExist != true) {
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

    async checkCategoryNameExist(name: string) : Promise<boolean> {
        const result = await this.categoryModel.findOne({
            where: {
                categoryName: {
                    [Op.iLike]: name
                }
            }
        })

        return result != null;
    }
}