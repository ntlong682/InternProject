import { ProductMetaDataDTO } from "./productMetadata.dto";

export class ViewProductDetailDTO {
    id: number;
    name: string;
    price: number;
    oldPrice: number;
    categoryName: string;
    cpuName: string;
    screen: number;
    ram: number;
    rom: number;
    weight: number;
    totalQuantity: number;
    coverImg: string;
    imagesList: string[];
    metaData: ProductMetaDataDTO[];
    
}