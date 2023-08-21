import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from 'src/models/order.model';
import { OrderDetails } from 'src/models/orderdetails.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/models/user.model';


@Module({
    imports: [SequelizeModule.forFeature([Order, OrderDetails, User])],
    providers: [OrderService, AuthGuard, JwtService, UserService],
    controllers: [OrderController]
})
export class OrderModule {
}