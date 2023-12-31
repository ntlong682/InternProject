import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Color } from "./color.model";
import { Product } from "./product.model";

@Table
export class ProductDetails extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Product)
    @Column
    product_id: number

    @BelongsTo(() => Product)
    product: Product

    @Column
    cpuName: string;

    @Column
    screen: number;

    @Column
    ram: number;

    @Column
    rom: number;

    @Column
    weight: number;

    @ForeignKey(() => Color)
    @Column
    color_id: number

    @BelongsTo(() => Color)
    color: Color;

    @Column
    quantity:number;
}