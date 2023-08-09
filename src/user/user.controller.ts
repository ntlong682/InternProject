import { Body, Controller, Get, Post, Res, Response } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { response } from 'express';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    //run 1 time
    @Get('addadmin')
    async addAdminAcc() : Promise<String> {
        return this.userService.createAdmin();
    }
    
    @Get('list')
    async listUsers() : Promise<any> {
        return this.userService.findAll()
            
        
    }

    // @Post('register')
    // async createUser(@Body() body: CreateUserDTO) : Promise<boolean> {
        
    //     return this.userService.createUser(body);
    // }
}