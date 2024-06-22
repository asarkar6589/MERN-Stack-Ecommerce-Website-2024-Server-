import { NextFunction, Request, Response } from "express";
import MyErrorClass from "../utils/error.js";
import { CommentBodyType, DeleteParams, Params, QueryType, UpdateCommentBodyType } from "../types/comments.js";
import { commentModel } from "../models/comments.js";
import productModel from "../models/product.js";

export const newComment = async(req:Request<{}, QueryType,CommentBodyType>, res:Response, next:NextFunction) => {
    try {
        const user = req.user?._id;
        const {title, description} = req.body;

        if (!title || !description) {
            return next(new MyErrorClass("Please fill all the necessary information", 404));
        }

        const {productId} = req.query;

        if (!productId) {
            return next(new MyErrorClass("No Product Selected", 400));
        }

        const productFound = await productModel.findById(productId);
        if (!productFound) {
            return next(new MyErrorClass("No product found", 404));
        }

        // todo -> Handel the case when the same user is going to add multiple comments for a single product. Still it gives error.
        const commentExists = await commentModel.findOne({
            user,
            product:productId
        });
        
        if (commentExists) {
            return next(new MyErrorClass("You have already added a comment for this product", 400));
        }

        await commentModel.create({
            user,
            product: productId,
            title,
            description
        });

        return res.status(201).json({
            success: true,
            message: `Comment added successfully !`
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const commentByProduct = async(req:Request<{}, {}>, res:Response, next:NextFunction) => {
    try {
        const {product} = req.query;

        if (!product) {
            return next(new MyErrorClass("No product found", 404));
        }

        const comments = await commentModel.find({
            product
        }).populate({
            path: "user",
            select: "name photo"
        });

        return res.status(200).json({
            success: true,
            comments
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message, 500));
    }
}

export const deleteComment = async(req:Request<{}, DeleteParams>, res:Response, next:NextFunction) => {
    try {
        const {user_id, comment_id} = req.query;

        if (!user_id) {
            return next(new MyErrorClass("No user selected", 404));
        }

        if (!comment_id) {
            return next(new MyErrorClass("No comment selected", 404));
        }

        const comment = await commentModel.findById(comment_id);

        if (!comment) {
            return next(new MyErrorClass("No comment found", 404));
        }

        const user_in_comment = String(comment.user);

        if (user_id !== user_in_comment) {
            return next(new MyErrorClass("You are not allowed to delete other's comments", 401));
        }

        await comment.deleteOne();

        return res.status(200).json({
            success: true,
            message: `Comment Deleted Successfully!`
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message, 500));
    }
}

export const updateComment = async(req:Request<Params, {}, UpdateCommentBodyType>, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        const {title, description} = req.body;

        if (!id) {
            return next(new MyErrorClass("Please Select a comment", 404));
        }

        const loggedInUser = String(req.user?._id);

        const comment = await commentModel.findById(id);

        if (!comment) {
            return next(new MyErrorClass("No comments found", 404));
        }

        const commentedUser = String(comment.user);

        if (loggedInUser !== commentedUser) {
            return next(new MyErrorClass("Your are not allowed to delete others comment", 401));
        }

        if (title) {
            comment.title = title;
        }

        if (description) {
            comment.description = description;
        }

        await comment.save();

        return res.status(200).json({
            success: true,
            message: "Comment Updated Successfully",
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message, 500));
    }
}

export const getCommentById = async(req:Request<Params, {}, {}>, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        if (!id) {
            return next(new MyErrorClass("Please Select a comment", 404));
        }

        const comment = await commentModel.findById(id);

        if (!comment) {
            return next(new MyErrorClass("No comments found", 404));
        }

        return res.status(200).json({
            success: true,
            comment
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message, 500));
    }
}
