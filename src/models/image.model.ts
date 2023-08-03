import { AutoIncrement, BelongsTo, Column, Table, Model, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { Product } from "./product.model";
@Table
export class Image extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    imgUrl: string;

    @ForeignKey(() => Product)
    @Column
    product_id: number

    @BelongsTo(() => Product)
    product: Product;
}