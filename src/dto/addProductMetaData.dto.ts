import { IsNotEmpty, IsNumberString } from "class-validator";

export class AddProductMetaData {

    @IsNotEmpty()
    @IsNumberString()
    id: number
    @IsNotEmpty()
    @IsNumberString()
    color: number
    @IsNotEmpty()
    @IsNumberString()
    quantity: number
}