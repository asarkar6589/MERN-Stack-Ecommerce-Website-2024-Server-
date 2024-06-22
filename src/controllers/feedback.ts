import { NextFunction, Request, Response } from "express";
import MyErrorClass from "../utils/error.js";
import { feedbackModel } from "../models/feedback.js";

export const newFeedback = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user?._id;

        const feedbacks = await feedbackModel.find({
            user
        });

        if (feedbacks.length > 0) {
            return next(new MyErrorClass("You are allowed to give only 1 feedback", 400));
        }

        const {rating, feedback} = req.body;

        if (!feedback || !rating) {
            return next(new MyErrorClass("Please Enter All the Fields", 400));
        }

        await feedbackModel.create({
            user,
            rating,
            feedback
        });

        return res.status(201).json({
            success: true,
            message: "Thank You for the feedback !"
        })
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getGoodFeedbacks = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const feedbacks = await feedbackModel.find({
            rating: {
                $gte: 3
            }
        });

        return res.status(200).json({
            success: true,
            feedbacks
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getAllFeedback = (req: Request, res: Response, next: NextFunction) => {
    
}

export const getAllFeedbackAdmin = (req: Request, res: Response, next: NextFunction) => {
    
}