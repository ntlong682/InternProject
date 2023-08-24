import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from 'src/models/order.model';
import { OrderDetails } from 'src/models/orderdetails.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/models/user.model';
import { ProductDetails } from 'src/models/productdetails.model';
import { Product } from 'src/models/product.model';

@Module({
    imports: [SequelizeModule.forFeature([Order, OrderDetails, Product, ProductDetails, User])
        , UserModule, JwtModule],
    providers: [OrderService, AuthGuard, JwtService, UserService],
    controllers: [OrderController],
})
export class OrderModule {
}