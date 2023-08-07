import { Controller, Post, Param, Query, Req, Body, Get } from '@nestjs/common';
import { ColorService } from './color.service';
import { Color } from 'src/models/color.model';

@Controller('color')
export class ColorController{
    constructor(private readonly colorService: ColorService){}

    @Get('list')
    async listColor() : Promise<Color[]> {
        return this.colorService.findAll();
    }

    @Post('create')
    async createColor(@Query('color') color:string): Promise<string> {
        return this.colorService.createColor(color);
    }
}