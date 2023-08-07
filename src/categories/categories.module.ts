import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Categories } from "src/models/categories.model";

@Module({
    imports: [SequelizeModule.forFeature([Categories])],
    providers: [CategoriesService],
    controllers: [CategoriesController],
})
export class CategoriesModule {    
}