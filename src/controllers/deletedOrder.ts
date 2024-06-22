import { NextFunction, Request, Response } from "express";
import { deletedOrderModel } from "../models/deletedOrder.js";
import MyErrorClass from "../utils/error.js";

export const getAllCancelledOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await deletedOrderModel.find({});

        return res.status(201).json({
            success: true,
            orders
        })

    } catch (error: any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const updateCancelledOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const order = await deletedOrderModel.findById(id);

        if (!order) {
            return next(new MyErrorClass("No cancelled order found", 500));
        }

        switch (order.refundStatus) {
            case "Processing":
                order.refundStatus = "Refunded"
                break;
        
            default:
                order.refundStatus = "Refunded"
                break;
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order Updated Successfully!"
        });

    } catch (error: any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getCancelledOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const order = await deletedOrderModel.findById(id).populate("user");

        if (!order) {
            return next(new MyErrorClass("No cancelled order found", 500));
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error: any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}
