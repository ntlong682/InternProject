import { Body, Controller, Post, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Categories } from 'src/models/categories.model';
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService){}

    //run 1 time
    @Get('addCategory')
    async addCategory() : Promise<any> {
        return this.categoriesService.addCategory();
    }

    @Get('list')
    async list(): Promise<Categories[]> {
        return this.categoriesService.findAll();
    }
}