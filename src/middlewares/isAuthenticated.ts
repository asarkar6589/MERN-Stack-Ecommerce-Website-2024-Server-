import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.js";
import { Document } from "mongoose";
import MyErrorClass from "../utils/error.js";

export interface User extends Document {
    _id: string,
    name: string,
    number: number,
    dob: Date,
    email: string,
    password: string,
    gender: "Male" | "Female",
    photo: string,
    role: "User" | "Admin",
    createdAt: Date, // Because of timestamps, this will also come.
    updatedAt: Date // Because of timestamps, this will also come.
}

export const isAuthenticated = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {token} = req.cookies;

        if (!token) {
            return next(new MyErrorClass("Please First Login", 404));
        }

        const id = jwt.decode(token);

        const userInfo = await UserModel.findById(id);

        if (!userInfo) {
            return next(new MyErrorClass("No User Found", 404));
        }
        
        req.user = {
            ...userInfo.toJSON(),
            _id: userInfo._id.toString(),
        } as User;

        next();
    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}
