import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Order } from "./order.model";
import { Product } from "./product.model";
import { ProductDetails } from "./productdetails.model";

@Table
export class OrderDetails extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    quantity: number;

    @Column
    price: number;

    @ForeignKey(() => Order)
    @Column
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => Product)
    @Column
    product_id: number;

    @BelongsTo(() => Product)
    product: Product;

    @ForeignKey(() => ProductDetails)
    @Column
    productDetails_id: number

    @BelongsTo(() => ProductDetails)
    productDetails: ProductDetails;
}