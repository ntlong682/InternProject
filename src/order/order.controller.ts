import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('order')
export class OrderController {

    @UseGuards(AuthGuard)
    @Get('list')
    async listAllOrderAdmin() {

    }

    @UseGuards(AuthGuard)
    @Post('create')
    async createOrder() {
        
    }
}