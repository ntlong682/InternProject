import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // @Get('addadmin')
    // async addAdminAcc() : Promise<String> {
    //     return this.userService.createAdmin();
    // }
    
    @Get('list')
    async listUsers() : Promise<any> {
        return this.userService.findAll();
    }
}