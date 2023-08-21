import { InjectModel } from "@nestjs/sequelize";
import { Order } from "src/models/order.model";
import { OrderDetails } from "src/models/orderdetails.model";

export class OrderService {
    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
        @InjectModel(OrderDetails)
        private orderDetailsModel: typeof OrderDetails
    ){}

    async checkProductExistInOrder(productId: number) : Promise<boolean> {
        const result = await this.orderDetailsModel.findAndCountAll({
            where: {
                product_id: productId
            }
        })
        return result.count == 0;
    }

    async checkProductDetailExistInOrder(productDetailsId: number) : Promise<boolean> {
        const count = await this.orderDetailsModel.count({
            where: {
                productDetails_id: productDetailsId
            }
        })

        return count > 0;
    }
}