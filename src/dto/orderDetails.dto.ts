import {OrderDetailMetaDataDTO } from "./orderDetailMetadata.dto";

export class OrderDetailsDTO {
    
    orderId: number;

    userId: number;

    userName: string;

    orderState: boolean;

    orderDetails: OrderDetailMetaDataDTO[];

    totalPrice: number;

}