import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './models/roles.model';
import { User } from './models/user.model';
import { Categories } from './models/categories.model';
import { Color } from './models/color.model';
import { Product } from './models/product.model';
import { ProductDetails } from './models/productdetails.model';
import { Order } from './models/order.model';
import { OrderDetails } from './models/orderdetails.model';
import { Image } from './models/image.model';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ColorModule } from './color/color.module';
import { ProductModule } from './product/product.module';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      // host: 'localhost',
      host: '221.132.29.226',
      port: 5432,
      username: 'postgres',
      password: 'test12345',
      database: 'OnlineShop',
      schema: 'public',
      autoLoadModels: true,
      synchronize: false,
      sync: {
        alter: true
      },
      models: [Role, User, Categories, Color, Product, Image, ProductDetails, Order, OrderDetails],
    }),
    MulterModule.register({
      dest: './files',
    }), RoleModule, UserModule, AuthModule, CategoriesModule, ColorModule, ProductModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
