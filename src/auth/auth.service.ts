import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { LoginUserDTO } from 'src/dto/loginuser.dto';
import { User } from 'src/models/user.model';
import { UserService } from 'src/user/user.service';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private sequelize: Sequelize,
        private readonly userService: UserService
    ) { }

    async register(registerUser: CreateUserDTO): Promise<boolean> {
        let existAcc = await (this.userService.findOneByUsername(registerUser.username));
        console.log(existAcc);
        let flag = false;
        if (existAcc == null) {
            if (registerUser.password == registerUser.repassword) {

                    await this.userModel.create({
                        userName: registerUser.username,
                        password: registerUser.password,
                        role_id: 2
                    });

                
                flag = true;
            } else {

                flag = false;
            }

        } else {
            flag = false;
        }
        return flag;
    }

    async login(loginUser: LoginUserDTO) : Promise<any> {
        let loginAcc = await (this.userService.findOneByLoginData(loginUser.username, loginUser.password));
        if(loginAcc != null) {
            return loginAcc;
        } else {
            throw new UnauthorizedException();
        }
    }
}