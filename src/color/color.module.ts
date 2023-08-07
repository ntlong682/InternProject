import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Color } from 'src/models/color.model';
import { ColorService } from './color.service';
import { ColorController } from './color.controller';
@Module({
    imports:[SequelizeModule.forFeature([Color])],
    providers:[ColorService],
    controllers: [ColorController],
})
export class ColorModule{}