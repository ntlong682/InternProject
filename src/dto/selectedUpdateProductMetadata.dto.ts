import { Color } from "src/models/color.model";

export class SelectedUpdateProductMetaData {
    id: number;
    colorId: number;
    quantity: number;
    colorList: Color[];
}