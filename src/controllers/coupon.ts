import { NextFunction, Request, Response } from "express";
import { deleteCoupon, newCouponBody } from "../types/coupon.js";
import MyErrorClass from "../utils/error.js";
import { couponModel } from "../models/coupons.js";

export const newCoupon = async(req:Request<{}, {}, newCouponBody>, res:Response, next:NextFunction) => {
    try {
        const {name, discount} = req.body;

        if (!name || !discount) {
            return next(new MyErrorClass("Please enter all the details", 404));
        }

        const x = await couponModel.find({
            name
        });

        if (x.length > 0) {
            return next(new MyErrorClass("Cannot create coupon with same name", 400));
        }

        await couponModel.create({
            name,
            discount
        });

        return res.status(201).json({
            success: true,
            message: `New Coupon with name ${name} and discount of Rs - ${discount} has been created`
        })
    }
    catch(error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const deletecoupon = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        if (!id) {
            return next(new MyErrorClass("Please select a coupon", 400));
        }

        const coupon = await couponModel.findById(id);

        if (!coupon) {
            return next(new MyErrorClass("Please select a coupon", 400));
        }

        await coupon.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Coupon Deleted Successfully !"
        });
    }
    catch(error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const updateCoupon = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        if (!id) {
            return next(new MyErrorClass("Please select a coupon", 400));
        }

        const coupon = await couponModel.findById(id);

        if (!coupon) {
            return next(new MyErrorClass("Please select a coupon", 400));
        }

        const {name, discount} = req.body;

        if (name) {
            coupon.name = name;
        }

        if (discount) {
            coupon.discount = discount;
        }

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon Updated Successfully",
        });
    }
    catch(error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getCouponById = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        if (!id) {
            return next(new MyErrorClass("Please select a coupon", 400));
        }

        const coupon = await couponModel.findById(id);

        if (!coupon) {
            return next(new MyErrorClass("Please select a coupon", 400));
        }

        return res.status(200).json({
            success: true,
            coupon
        });
    }
    catch(error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getAllCoupons = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const coupons = await couponModel.find();

        return res.status(200).json({
            success: true,
            coupons
        });
    }
    catch(error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}


export const checkCoupon = async(req:Request<{name: string}>, res:Response, next:NextFunction) => {
    try {
        const {name} = req.params;

        if (!name) {
            return;
        }

        const coupon = await couponModel.find({name});

        if (coupon.length === 0) {
            return res.status(400).json({
                success: false,
                discount: 0
            });
        }

        return res.status(200).json({
            success: true,
            discount: coupon[0].discount
        });
    }
    catch(error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}
