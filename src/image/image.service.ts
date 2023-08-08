import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Image } from 'src/models/image.model';
@Injectable()
export class ImageService {
    constructor(
        @InjectModel(Image)
        private imageModel: typeof Image,
        private sequelize: Sequelize
    ){}

    async addImage(imgName : string, imgUrl : string, productId : number) : Promise<boolean> {
        try {
            await this.imageModel.create({
                imgUrl : imgUrl,
                product_id : productId,
                imgName : imgName
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async checkImageNotExist(imageName : string) : Promise<boolean> {
        try {
            const result = this.imageModel.findOne({
                where : {
                    imgName : imageName
                }
            })
            return result == null;
        } catch (error) {
            return false;
        }
    }
}