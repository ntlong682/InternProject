import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
@Controller('role')
export class RoleController {
    constructor(private readonly userService: RoleService) {}

    @Get('add')
    async addRole() : Promise<String> {
        return this.userService.createRole();
    }

}