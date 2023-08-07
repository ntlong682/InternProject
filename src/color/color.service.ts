import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Color } from 'src/models/color.model';

@Injectable()
export class ColorService{
    constructor(
        @InjectModel(Color)
        private colorModel: typeof Color,
        private sequelize: Sequelize
    ){}

    async findAll() : Promise<Color[]> {
        return this.colorModel.findAll();
    }

    async createColor(name: string) : Promise<string> {
        try {
            await this.colorModel.create({
                name: name
            });
            return  "Add color successfully!"
        } catch (error) {
            return "Add color failed!";
        }
    }
}