import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/models/user.model';
@Injectable()
export class UserService{
    constructor(
    @InjectModel(User)
    private userModel: typeof User, 
    private sequelize: Sequelize
    ){}

    async createAdmin() : Promise<any> {
        try {
            await this.sequelize.transaction(async t => {
                const transactionHost = {transaction: t};

                // await this.userModel.create({
                //     userName: 'admin', password: '123456'
                // });
            });
        } catch (error) {
            
        }
    }
}