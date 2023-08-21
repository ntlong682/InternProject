import { Controller, Post, Param, Query, Req, Body, Get, UseGuards, Delete } from '@nestjs/common';
import { ColorService } from './color.service';
import { Color } from 'src/models/color.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { Auth } from 'googleapis';

@Controller('color')
export class ColorController{
    constructor(private readonly colorService: ColorService){}

    // http://localhost:3000/color/list
    @UseGuards(AuthGuard)
    @Get('list')
    async listColor() : Promise<Color[]> {
        return this.colorService.findAll();
    }

    // http://localhost:3000/color/create
    @UseGuards(AuthGuard)
    @Post('create')
    async createColor(@Query('color') color:string): Promise<string> {
        return this.colorService.createColor(color);
    }

    @UseGuards(AuthGuard)
    @Delete('delete')
    async deleteColor(@Query('id') id: number) : Promise<{status, message}> {
        const result = await this.colorService.deleteColorById(+id);
        if(result == true) {
            return {
                status: true.valueOf(),
                message: 'Xóa màu thành công'
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Xóa màu thất bại'
            }
        }
    }
}