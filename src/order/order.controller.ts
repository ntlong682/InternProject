import { Put } from '@nestjs/common';
import { Controller, Get, UseGuards, Post, Body, Query } from '@nestjs/common';
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
    async listAllOrderAdmin(): Promise<{ status, message, data }> {
        const result = await this.orderService.listOrderForAdmin();

        if (result == null || result.length == 0) {
            return {
                status: false.valueOf(),
                message: 'Load đơn hàng thất bại',
                data: null
            }
        } else {
            return {
                status: true.valueOf(),
                message: 'Load đơn hàng thành công',
                data: result
            }
        }
    }

    @Get('order-details')
    async getOrderDetailsForAdmin(@Query('orderId') id: number) {
        
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

    @UseGuards(AuthGuard)
    @Put('change-status')
    async changeOrderStatus(@Query('orderId') orderId: number, @Query('status') status: boolean)
    : Promise<{status, message}> {
        const result = await this.orderService.changeStatusOfOrder(orderId, status);
        if(result == true) {
            return {
                status: true.valueOf(),
                message: 'Update trạng thái thành công'
            }
        } else {
            return {
                status: false.valueOf(),
                message: 'Update trạng thái thất bại'
            }
        }
        
    }
}