import { NextFunction, Request, Response } from "express";
import MyErrorClass from "../utils/error.js";
import { stripe } from "../index.js";

export const createPayementIntent = async(req: Request, res:Response, next: NextFunction) => {
    try {
        const {amount} = req.body;

        if (!amount) {
            return next(new MyErrorClass("Please Enter the Ammount", 400));
        }

        const payementIntent = await stripe.paymentIntents.create({
            // we receive amount in the smallest currency, for inr it is paisa, so we multipliy it with 100 to get in rupees.
            amount: Number(amount) * 100,
            currency: "inr"
        });

        return res.status(201).json({
            success: true,
            clinet_secret: payementIntent.client_secret
        })
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}
