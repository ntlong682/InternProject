import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Categories } from 'src/models/categories.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateCategoryDTO } from 'src/dto/createCategory.dto';
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


    @UseGuards(AuthGuard)
    @Post('create')
    async create(@Body() body: CreateCategoryDTO) : Promise<{status, message}> {
        const result = await this.categoriesService.createCategory(body.name);
        if(result == true) {
            return {
                status: result.valueOf(),
                message: 'Thêm loại sản phẩm thành công'
            }
        } else {
            return {
                status: result.valueOf(),
                message: 'Thêm loại sản phẩm thất bại'
            }
        }
    }
}