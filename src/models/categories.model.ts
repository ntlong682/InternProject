import { Column, Model, Table, PrimaryKey, AutoIncrement, HasMany } from 'sequelize-typescript';
import { Product } from './product.model';

@Table
export class Categories extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
    
    @Column
    categoryName: string;

    @HasMany(() => Product)
    products: Product[];
}