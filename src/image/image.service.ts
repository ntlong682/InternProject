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
    ) { }

    async findAllImgByProductId(id: number) : Promise<Image[]>{
        const result = this.imageModel.findAll({
            where: {
                product_id: id
            }
        });
        return result
    }

    async addImage(imgName: string, imgUrl: string, productId: number): Promise<boolean> {
        try {
            await this.imageModel.create({
                imgUrl: imgUrl,
                product_id: productId,
                imgName: imgName
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async checkImageNotExist(imageName: string): Promise<boolean> {
        try {
            const result = await this.imageModel.findOne({
                where: {
                    imgName: imageName
                }
            })
            if(result == null) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    async findCoverImageByProductId(productId: number): Promise<Image> {
        return await this.imageModel.findOne({
            where: {
                product_id: productId,
                imgName: 'Cover%'
            }
        });
    }

    async deleteImageByProductId(productId: number) {
        try {
            await this.imageModel.destroy({
                where: {
                    product_id: productId
                }
            })
        } catch (error) {
            throw error;
        }

    }
}