import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./user.model";

@Table
export class Role extends Model{


    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
    
    @Column
    roleName: string;

    // @HasMany(() => User)
    // users: User[]
}