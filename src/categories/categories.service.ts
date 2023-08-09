import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
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
}