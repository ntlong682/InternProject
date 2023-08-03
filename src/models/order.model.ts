import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./user.model";
import { OrderDetails } from "./orderdetails.model";

@Table
export class Order extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    totalPrice: number;

    @Column
    orderState: boolean;

    @ForeignKey(() => User)
    @Column
    user_id: number

    @BelongsTo(() => User)
    user: User;

    @HasMany(() => OrderDetails)
    orderDetails: OrderDetails[];
}