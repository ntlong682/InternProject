import { InjectModel } from "@nestjs/sequelize";
import { CustomerOrderDTO } from "src/dto/customerOrder.dto";
import { Order } from "src/models/order.model";
import { OrderDetails } from "src/models/orderdetails.model";
import { UserService } from "src/user/user.service";

export class OrderService {
    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
        @InjectModel(OrderDetails)
        private orderDetailsModel: typeof OrderDetails,
        private readonly userService: UserService
    ) { }

    async checkProductExistInOrder(productId: number): Promise<boolean> {
        const result = await this.orderDetailsModel.findAndCountAll({
            where: {
                product_id: productId
            }
        })
        return result.count == 0;
    }

    async checkProductDetailExistInOrder(productDetailsId: number): Promise<boolean> {
        const count = await this.orderDetailsModel.count({
            where: {
                productDetails_id: productDetailsId
            }
        })

        return count > 0;
    }


    async createOrder(totalPrice: number, uid: number): Promise<Order> {
        const result = await this.orderModel.create({
            totalPrice: totalPrice,
            orderState: false,
            user_id: uid
        });
        return result;
    }

    async createOrderDetail(quantity: number, price: number, order_id: number,
        product_id: number, productDetail_id: number) : Promise<OrderDetails> {
            const result = await this.orderDetailsModel.create({
                quantity: quantity,
                price: price * quantity,
                order_id: order_id,
                product_id: product_id,
                productDetails_id: productDetail_id
            });

            if(result != null) {
                return result;
            } else {
                return null;
            }
    }

    async createOrderForUser(customerOrder: CustomerOrderDTO): Promise<boolean> {
        try {
            const user = await this.userService.findOneByUsername(customerOrder.userName);
            if (user != null) {
                const uid = user.id;
                const order = await this.createOrder(customerOrder.totalPrice, uid);
                if (order != null) {
                    for(const p of Object.values(customerOrder.listProduct)) {
                        await this.createOrderDetail(p.quantity, p.price, order.id,
                             p.productId, p.productDetailId);
                    }
                    return true;
                }
            }
        } catch (error) {
            console.log(error);
        }

        return false;
    }
}