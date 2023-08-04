import { IsString, IsNotEmpty } from "class-validator";

export class CreateUserDTO {
    @IsNotEmpty()
    @IsString()
    username: string;
    @IsNotEmpty()
    @IsString()
    password: string;
    @IsNotEmpty()
    @IsString()
    repassword: string;
}