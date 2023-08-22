import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CustomerOrderDTO } from "src/dto/customerOrder.dto";
import { Order } from "src/models/order.model";
import { OrderDetails } from "src/models/orderdetails.model";
import { ProductDetails } from "src/models/productdetails.model";
import { UserService } from "src/user/user.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
        @InjectModel(OrderDetails)
        private orderDetailsModel: typeof OrderDetails,
        @InjectModel(ProductDetails)
        private productDetailsModel: typeof ProductDetails,
        private readonly userService: UserService,
        private sequelize: Sequelize,
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
        product_id: number, productDetail_id: number): Promise<OrderDetails> {
        const result = await this.orderDetailsModel.create({
            quantity: quantity,
            price: price * quantity,
            order_id: order_id,
            product_id: product_id,
            productDetails_id: productDetail_id
        });

        if (result != null) {
            return result;
        } else {
            return null;
        }
    }

    async plusQuantity(productDetailsId: number, quantity: number,
        productDetailsModel: typeof ProductDetails) {
        const tempDetails = await productDetailsModel.findOne({
            where: {
                id: productDetailsId
            }
        });

        if (tempDetails.quantity + quantity > 0) {
            await productDetailsModel.update({
                quantity: tempDetails.quantity + quantity
            }, {
                where: {
                    id: productDetailsId
                }
            });
        } else {
            throw new Error('Add stock invalid at: ' + productDetailsId);
        }

    }

    async minusQuantity(productDetailsId: number, quantity: number,
        productDetailsModel: typeof ProductDetails) {
        const tempDetails = await productDetailsModel.findOne({
            where: {
                id: productDetailsId
            }
        });
        if (tempDetails.quantity >= quantity) {
            await productDetailsModel.update({
                quantity: tempDetails.quantity - quantity
            }, {
                where: {
                    id: productDetailsId
                }
            });
        } else {
            throw new Error('Product out of stock at: ' + productDetailsId);
        }
    }

    async changeQuantityOfProduct(callback, orderId: number,
        productDetailsModel: typeof ProductDetails): Promise<boolean> {
        const orderDetails = await this.orderDetailsModel.findAll({
            where: {
                order_id: orderId
            }
        });

        const transaction = await this.sequelize.transaction();
        try {
            for (const od of Object.values(orderDetails)) {
                await callback(od.productDetails_id, od.quantity, productDetailsModel);
            }
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.log("Transaction rollback: " + error);
        }
        return false;
    }

    async checkOrderExist(orderId: number): Promise<boolean> {
        const count = await this.orderModel.count({
            where: {
                id: orderId
            }
        })

        return count > 0;
    }

    async changeStatusOfOrder(orderId: number, newStatus: boolean): Promise<boolean> {
        let flag = false;
        const checkOrderExist = await this.checkOrderExist(orderId);
        if (checkOrderExist == true) {
            let checkUpdateQuantity: boolean;
            if (newStatus == true) {
                checkUpdateQuantity = await this.changeQuantityOfProduct(this.minusQuantity, orderId, this.productDetailsModel);
            } else {
                checkUpdateQuantity = await this.changeQuantityOfProduct(this.plusQuantity, orderId, this.productDetailsModel);
            }

            if (checkUpdateQuantity == true) {
                await this.orderModel.update({
                    orderState: newStatus
                }, {
                    where: {
                        id: orderId
                    }
                })

                flag = true;
            }
        }

        return flag;
    }

    async createOrderForUser(customerOrder: CustomerOrderDTO): Promise<boolean> {
        try {
            const user = await this.userService.findOneByUsername(customerOrder.userName);
            if (user != null) {
                const uid = user.id;
                const order = await this.createOrder(customerOrder.totalPrice, uid);
                if (order != null) {
                    for (const p of Object.values(customerOrder.listProduct)) {
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

    async listOrderForAdmin(): Promise<Order[]> {
        const result = await this.orderModel.findAll({
            include: [
                {
                    model: OrderDetails
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        });
        return result;
    }
}