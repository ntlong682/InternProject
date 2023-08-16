import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Categories } from "./categories.model";
import { Image } from "./image.model";
import { ProductDetails } from "./productdetails.model";

@Table
export class Product extends Model {
 
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column(DataType.DOUBLE)
    price: number;

    @Column(DataType.DOUBLE)
    oldPrice: number;

    @ForeignKey(() => Categories)
    @Column
    category_id: number

    @BelongsTo(() => Categories)
    category: Categories;

    @HasMany(() => Image)
    imgList: Image[];

    @HasMany(() => ProductDetails)
    productDetails: ProductDetails[];

}