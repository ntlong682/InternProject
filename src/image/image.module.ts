import { Module } from "@nestjs/common";
import { ImageController } from "./image.controller";
import { Sequelize } from "sequelize";
import { SequelizeModule } from "@nestjs/sequelize";
import { ImageService } from "./image.service";

@Module({
    imports: [SequelizeModule.forFeature([Image])],
    controllers: [ImageController],
    providers: [ImageService]
})
export class ImageModule{}
