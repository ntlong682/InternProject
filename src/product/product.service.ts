import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Product } from "src/models/product.model";

@Injectable()
export class ProductService{
    constructor(
        @InjectModel(Product)
        private productModel: typeof Product,
        private sequelize: Sequelize
    ){}

    
}