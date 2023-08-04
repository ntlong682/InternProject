import { CreateUserDTO } from 'src/dto/createUser.dto';
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


    // async createAdmin() : Promise<String> {
    //     try {
    //         await this.sequelize.transaction(async t => {
    //             const transactionHost = {transaction: t};

    //             await this.userModel.create({
    //                 userName: 'admin', password: '123456', role_id: 1
    //             }, transactionHost);
    //         });

    //         return "Add admin account successful";
    //     } catch (error) {
    //         return "Add admin account failed";
    //     }
    // }

    async findAll() : Promise<any> {
        return this.userModel.findAll();
    }

    // async createUser(createUserDTO: CreateUserDTO) : Promise<boolean> {
    //     var usernameExist = this.userModel.findOne({where: {
    //         createUserDTO
    //     }});
        
    //     return false;
    // }

    async findOneByUsername(username: string) : Promise<User> {
        return this.userModel.findOne({
            where: {
                userName : username,
            }
        })
    }

    async findOneByLoginData(username: string, password: string) : Promise<User> {
        return this.userModel.findOne({
            where: {
                userName: username,
                password: password,
            }
        })
    }
}