import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Color } from "./color.model";

@Table
export class ProductDetails extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

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