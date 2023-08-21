import { IsNotEmpty, IsNumberString, IsString } from "class-validator";
import { PurchasedProductDtO } from "./purchasedProduct.dto";

export class CustomerOrderDTO {
    @IsNotEmpty()
    @IsString()
    userName: string;

    @IsNotEmpty()
    listProduct: PurchasedProductDtO[]

    @IsNotEmpty()
    @IsNumberString()
    totalPrice: number;
}