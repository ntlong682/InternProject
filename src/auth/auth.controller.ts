import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import { LoginUserDTO } from 'src/dto/loginuser.dto';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    //http://localhost:3000/auth/register
    @Post('register')
    async register(@Body() body : CreateUserDTO) : Promise<any> {
        const registerStatus = this.authService.register(body);
        
        // return response.status(HttpStatus.CREATED).json({
        //     registerStatus
        // })
        return {
            status: (await registerStatus).valueOf()
        };
    }
    //path: /auth/login
    @Post('login')
    async login(@Body() body : LoginUserDTO) : Promise<any> {
        return this.authService.validateLogin(body);
    }
}