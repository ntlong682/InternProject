import { CreateUserDTO } from 'src/dto/createUser.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private sequelize: Sequelize
    ) { }


    //run 1 time
    async createAdmin(): Promise<String> {
        try {
            await this.sequelize.transaction(async t => {
                const salt = 10;
                const hash = await bcrypt.hash("123456", salt);
                await this.userModel.create({
                    userName: 'admin', password: hash, role_id: 1
                });
            });

            return "Add admin account successful";
        } catch (error) {
            return "Add admin account failed";
        }
    }

    async findAll(): Promise<any> {
        return this.userModel.findAll();
    }

    // async createUser(createUserDTO: CreateUserDTO) : Promise<boolean> {
    //     var usernameExist = this.userModel.findOne({where: {
    //         createUserDTO
    //     }});

    //     return false;
    // }

    async findOneByUsername(username: string): Promise<User> {
        return this.userModel.findOne({
            where: {
                userName: username,
            }
        })
    }

    async findOneByLoginData(username: string, password: string): Promise<User> {
        const user = await this.userModel.findOne({
            where: {
                userName: username,
            }
        })
        if (user != null) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch == true) {
                return user;
            } else {
                return null;
            }
        } else {
            return null;
        }

    }
}