import { IsString, IsNotEmpty } from "class-validator";

export class LoginUserDTO {
    @IsNotEmpty()
    @IsString()
    username: string;
    @IsNotEmpty()
    @IsString()
    password: string;
}