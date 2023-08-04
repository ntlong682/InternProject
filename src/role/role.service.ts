import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Role } from "src/models/roles.model";

@Injectable()
export class RoleService{
    constructor(
        @InjectModel(Role)
        private roleModel: typeof Role,
        private sequelize: Sequelize
    ){}

    // async createRole() : Promise<String> {
    //     try {
    //         await this.sequelize.transaction(async t => {
    //             const transactionHost = {transaction: t};
    //             await this.roleModel.create(
    //                 {roleName: 'Admin'}, transactionHost,
    //             );
    //             await this.roleModel.create(
    //                 {roleName: 'Customer'}, transactionHost,
    //             )
            
    //         });
    //         return 'Create role successfully!';
            
    //     }
    //      catch (error) {
    //         return 'Create role failed!';
    //     }
    // }

    async findAll(): Promise<Role[]> {
        return this.roleModel.findAll();
    }

}