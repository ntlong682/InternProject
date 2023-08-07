import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { LoginUserDTO } from 'src/dto/loginuser.dto';
import { User } from 'src/models/user.model';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private sequelize: Sequelize,
        private readonly userService: UserService,
        private jwtService: JwtService
    ) { }

    async register(registerUser: CreateUserDTO): Promise<any> {
        let existAcc = await (this.userService.findOneByUsername(registerUser.username));
        console.log(existAcc);
        let flag = false;
        if (existAcc == null) {
            if (registerUser.password == registerUser.repassword) {
                    const salt = 10;
                    const hash = await bcrypt.hash(registerUser.password, salt);
                    await this.userModel.create({
                        userName: registerUser.username,
                        password: hash,
                        role_id: 2
                    });
                    
                    // return this.userService.findOneByUsername(registerUser.username);
                    
                
                flag = true;
            } else {

                flag = false;
            }

        } else {
            flag = false;
        }
        return flag;
    }

    async validateLogin(loginUser: LoginUserDTO) : Promise<any> {
        let loginAcc = await (this.userService.findOneByLoginData(loginUser.username, loginUser.password));
        if(loginAcc != null) {
            return this.login(loginUser);
        } else {
            throw new UnauthorizedException();
        }
    }

    async login(user: any) {
        const payload = {username: user.userName, sub: user.id};
        return {
            access_token: this.jwtService.sign(payload),
        }
    }
}