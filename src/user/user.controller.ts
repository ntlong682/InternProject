import { Body, Controller, Get, Post, Res, Response, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    //run 1 time
    @Get('addadmin')
    async addAdminAcc() : Promise<String> {
        return this.userService.createAdmin();
    }
    
    @UseGuards(AuthGuard)
    @Get('list')
    async listUsers() : Promise<any> {
        return this.userService.findAll()
            
        
    }




    // @Post('register')
    // async createUser(@Body() body: CreateUserDTO) : Promise<boolean> {
        
    //     return this.userService.createUser(body);
    // }
}