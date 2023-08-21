import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthGuard } from 'src/auth/auth.guard';
import { CustomerOrderDTO } from 'src/dto/customerOrder.dto';
import { OrderService } from './order.service';
@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @UseGuards(AuthGuard)
    @Get('list')
    async listAllOrderAdmin() {

    }
    // @UseGuards(AuthGuard)
    @Post('paynow')
    async createOrderPayNow() {

    }

    @Post('paylater')
    async createOrderPayLater(@Body() order: CustomerOrderDTO)
        : Promise<{ status, message }> {
        const result = await this.orderService.createOrderForUser(order);
        if (result == true) {
            return {
                status: true.valueOf(),
                message: "Thêm đơn hàng thành công"
            }
        } else {
            return {
                status: false.valueOf(),
                message: "Thêm đơn hàng thất bại"
            }
        }
    }
}