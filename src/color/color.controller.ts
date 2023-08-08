import { Controller, Post, Param, Query, Req, Body, Get } from '@nestjs/common';
import { ColorService } from './color.service';
import { Color } from 'src/models/color.model';

@Controller('color')
export class ColorController{
    constructor(private readonly colorService: ColorService){}

    // http://localhost:3000/color/list
    @Get('list')
    async listColor() : Promise<Color[]> {
        return this.colorService.findAll();
    }

    // http://localhost:3000/color/create
    @Post('create')
    async createColor(@Query('color') color:string): Promise<string> {
        return this.colorService.createColor(color);
    }
}