import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CustomerOrderDTO } from "src/dto/customerOrder.dto";
import { Order } from "src/models/order.model";
import { OrderDetails } from "src/models/orderdetails.model";
import { ProductDetails } from "src/models/productdetails.model";
import { UserService } from "src/user/user.service";
import { Injectable } from "@nestjs/common";
import { OrderDetailsDTO } from "src/dto/orderDetails.dto";
import { User } from "src/models/user.model";
import { OrderDetailMetaDataDTO } from "src/dto/orderDetailMetadata.dto";
import { Product } from "src/models/product.model";
import { Image } from "src/models/image.model";
import { Op } from "sequelize";

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
        @InjectModel(OrderDetails)
        private orderDetailsModel: typeof OrderDetails,
        @InjectModel(Product)
        private productModel: typeof Product,
        @InjectModel(ProductDetails)
        private productDetailsModel: typeof ProductDetails,
        @InjectModel(User)
        private userModel: typeof User,
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

    async getListOrderDetailByOrderId(orderId: number) {
        return await this.orderDetailsModel.findAll({
            where: {
                order_id: orderId
            }
        });
    }

    async getListOrderDetailsForAdmin(orderId: number) : Promise<OrderDetailsDTO> {
        const order = await this.orderModel.findOne({
            where: {
                id: orderId
            }
        })
        if (order != null) {
            const orderedUser = await this.userModel.findOne({
                where: {
                    id: order.user_id
                }
            });

            const orderDetails = await this.getListOrderDetailByOrderId(orderId);
            const orderMetaData: OrderDetailMetaDataDTO[] = [];
            for (const od of orderDetails) {
                const product = await this.productModel.findOne({
                    include: [
                        {
                            model: Image,
                            where: {
                                imgName: {
                                    [Op.startsWith]: "Cover"
                                }
                            }
                        }, {
                            model: ProductDetails
                        }
                    ], where: {
                        id: od.product_id
                    }
                })

                const tempMetaData: OrderDetailMetaDataDTO = {
                    orderDetailId: od.id,
                    productId: product.id,
                    productDetailId: od.productDetails_id,
                    coverImg: product.imgList[0].imgUrl,
                    productName: product.name,
                    quantity: od.quantity,
                    price: od.price
                }
                orderMetaData.push(tempMetaData);
            }

            const orderDetailsDTO: OrderDetailsDTO = {
                orderId: orderId,
                userId: order.user_id,
                userName: orderedUser.userName,
                orderState: order.orderState,
                orderDetails: orderMetaData,
                totalPrice: order.totalPrice
            }

            // console.log(orderDetailsDTO);
            return orderDetailsDTO;
        }
        return null;
    }

    async listOrderForUser(userId: number): Promise<Order[]> {
        const result = await this.orderModel.findAll({
            include: [
                {
                    model: OrderDetails
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ],
            where: {
                user_id: userId
            }
        });
        return result;
    }
}