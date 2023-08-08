import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class createProductDTO {
    @IsNotEmpty()
    @IsString()
    name : string
    
    @IsNotEmpty()
    @IsNumberString()
    price: number

    @IsNotEmpty()
    @IsNumberString()
    oldprice: number

    @IsNotEmpty()
    @IsNumberString()
    categoryId: number

    @IsNotEmpty()
    @IsString()
    cpu : string

    @IsNotEmpty()
    @IsNumberString()
    ram : number

    @IsNotEmpty()
    @IsNumberString()
    rom : number

    @IsNotEmpty()
    @IsNumberString()
    screen : number

    @IsNotEmpty()
    @IsNumberString()
    weight : number

    @IsNotEmpty()
    @IsNumberString()
    colorId : number

    @IsNotEmpty()
    @IsNumberString()
    quantity : number
}