import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class UpdateProductDTO {
    id : number

    name : string

    price: number

    oldprice: number

    categoryId: number

    cpu : string

    ram : number

    rom : number

    screen : number

    weight : number

    colorId : number

    quantity : number

    coverImg: string

    imgList: string[]
}