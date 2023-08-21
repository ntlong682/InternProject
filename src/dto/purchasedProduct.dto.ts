import { IsNotEmpty, IsNumberString } from "class-validator";

export class PurchasedProductDtO {
    @IsNotEmpty()
    @IsNumberString()
    productId: number;

    @IsNotEmpty()
    @IsNumberString()
    productDetailId: number;

    @IsNotEmpty()
    @IsNumberString()
    price: number;

    @IsNotEmpty()
    @IsNumberString()
    quantity: number;
}