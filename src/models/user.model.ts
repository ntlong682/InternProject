import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Role } from "./roles.model";
import { Order } from "./order.model";

@Table
export class User extends Model{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    userName: string;

    @Column
    password: string;

    @ForeignKey(() => Role)
    @Column
    role_id: number

    @BelongsTo(() => Role)
    role: Role

    @HasMany(() => Order)
    orders: Order[];
}