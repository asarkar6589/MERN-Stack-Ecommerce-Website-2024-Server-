import { NextFunction, Request, Response } from "express";
import MyErrorClass from "../utils/error.js";
import { Product, newOrderBody } from "../types/order.js";
import { orderModel } from "../models/order.js";
import productModel from "../models/product.js";
import { deletedOrderModel } from "../models/deletedOrder.js";

export const newOrder = async (req: Request<{}, {}, newOrderBody>, res: Response, next: NextFunction) => {
    try {
        const {product, discount, subTotal, shippingCharges, tax, shippingAddress, total} = req.body;

        const user = req.user;

        if (!product || !subTotal || !shippingAddress) {
            return next(new MyErrorClass("Please Enter all the necessory details", 404));
        }

        // placing the order.
        await orderModel.create({
            user,
            product,
            discount,
            subTotal,
            shippingCharges,
            tax,
            total,
            shippingAddress
        });

        // after placing the order, decrement the stock of the products
        for (let index = 0; index < product.length; index++) {
            let p:Product = product[index];
            const productFound = await productModel.findById(p.id);

            if (!productFound) {
                continue;
            }

            const quantity = p.quantity;

            const reducedStock: number = productFound.stock - quantity;

            if (reducedStock < 0) {
                productFound.stock = 0;
            }
            else {
                productFound.stock = reducedStock;
            }

            await productFound.save();
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully!"
        })

    } catch (error: any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getOrderByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        const orders = await orderModel.find({
            user
        });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const getAllAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderModel.find();

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const updateOrderByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const order = await orderModel.findById(id);

        if (!order) {
            return next(new MyErrorClass("Internal Server Error", 500));
        }

        switch (order.status) {
            case "Processing":
                order.status = "Shipped"
                break;
            case "Shipped":
                order.status = "Deliverd"
                break;
        
            default:
                order.status = "Processing"
                break;
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order updated successfully !",
        });

    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const deleteOrderByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const order = await orderModel.findById(id);

        if (!order) {
            return next(new MyErrorClass("No Order Exsits", 500));
        }

        // Todo -> To be checked.
        const loggedInUser = req.user?._id;
        console.log(loggedInUser);
        const orderedUser = order.user._id.toString();
        console.log(orderedUser);
        
        if (loggedInUser !== orderedUser) {
            return next(new MyErrorClass("You cannot delete others order", 401));
        }

        const products = order.product;
        await deletedOrderModel.create({
            user: order.user._id,
            product: order.product,
            discount: order.discount,
            shippingCharges: order.shippingCharges,
            shippingAddress: order.shippingAddress,
            tax: order.tax,
            status: order.status,
            total: order.total,
            subTotal: order.subTotal
        });

        // increase the stock when the order is cancelled.
        for (let index = 0; index < products.length; index++) {
            const element = products[index];
            const product = await productModel.findById(element.id);

            if (!product) {
                continue;
            }

            const quantity = element.quantity;
            product.stock += quantity;

            await product.save();
        }

        await order.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Order Deleted !",
        });

    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getOrderByAdminId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const order = await orderModel.findById(id).populate("user");

        if (!order) {
            return next(new MyErrorClass("No Order Exsits", 400));
        }

        // making a check that user can see only his/her order. 
        // const loggedInUser = req.user?._id;
        // const orderedUser = order.user._id.toString();
        // if (loggedInUser !== orderedUser) {
        //     console.log(loggedInUser !== orderedUser);
        //     return next(new MyErrorClass("You cannot delete others order", 401));
        // }

        return res.status(200).json({
            success: true,
            order,
        });       

    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const order = await orderModel.findById(id).populate("user");

        if (!order) {
            return next(new MyErrorClass("No Order Exsits", 400));
        }

        // making a check that user can see only his/her order. 
        const loggedInUser = req.user?._id;
        const orderedUser = order.user._id.toString();
        if (loggedInUser !== orderedUser) {
            console.log(loggedInUser !== orderedUser);
            return next(new MyErrorClass("You cannot delete others order", 401));
        }

        return res.status(200).json({
            success: true,
            order,
        });       

    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}
