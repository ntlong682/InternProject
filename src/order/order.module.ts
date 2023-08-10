import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from 'src/models/order.model';
import { OrderDetails } from 'src/models/orderdetails.model';


@Module({
    imports: [SequelizeModule.forFeature([Order, OrderDetails])],
    providers: [OrderService],
    controllers: [OrderController]
})
export class OrderModule {
}