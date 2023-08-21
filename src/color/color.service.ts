import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { where } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Color } from 'src/models/color.model';
import { ProductDetails } from 'src/models/productdetails.model';

@Injectable()
export class ColorService {
    constructor(
        @InjectModel(Color)
        private colorModel: typeof Color,
        @InjectModel(ProductDetails)
        private productDetails: typeof ProductDetails,
        private sequelize: Sequelize
    ) { }

    async findAll(): Promise<Color[]> {
        return this.colorModel.findAll();
    }

    async createColor(name: string): Promise<string> {
        try {
            await this.colorModel.create({
                name: name
            });
            return "Add color successfully!"
        } catch (error) {
            return "Add color failed!";
        }
    }

    async checkColorExist(colorId: number): Promise<boolean> {
        try {
            const result = await this.colorModel.findOne({
                where: {
                    id : colorId
                }
            });
            return result != null;
        } catch (error) {
            return false;
        }
    }

    async findColorById(colorId: number) : Promise<Color> {
        try {
            const result = await this.colorModel.findOne({where: {
                id: colorId
            }})
            // console.log(result);
            return result;
        } catch (error) {
            return null;
        }
    }

    async deleteColorById(id: number) : Promise<boolean> {
        let result = false;
        try {
            const count = await this.productDetails.count({where : {
                color_id: id
            }});

            if(count > 0) {
                result = false;
            } else {
                await this.colorModel.destroy({where: {
                    id: id
                }});
                result = true;
            }

        } catch (error) {
            console.log(error);
            result = false;
        }
        return result;
    }
}