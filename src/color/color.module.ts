import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Color } from 'src/models/color.model';
import { ColorService } from './color.service';
import { ColorController } from './color.controller';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ProductDetails } from 'src/models/productdetails.model';
@Module({
    imports:[SequelizeModule.forFeature([Color, ProductDetails])],
    providers:[ColorService, AuthGuard, JwtService],
    controllers: [ColorController],
})
export class ColorModule{}