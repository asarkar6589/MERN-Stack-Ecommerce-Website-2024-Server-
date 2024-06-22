import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import { commentModel } from "../models/comments.js";
import { deletedOrderModel } from "../models/deletedOrder.js";
import { orderModel } from "../models/order.js";
import { UserModel } from "../models/user.js";
import { RequestUserBody, RequestUserLoginBody } from "../types/user.js";
import MyErrorClass from "../utils/error.js";
import { feedbackModel } from "../models/feedback.js";

export const newUser = async(req: Request<{}, {}, RequestUserBody>, res: Response, next: NextFunction) => {
    try {
        const {
            name,
            number,
            dob,
            email,
            password,
            gender,
        } = req.body;
        
        const photo = req.file;

        if (!photo) {
            return next(new MyErrorClass("Please provide a photo", 400));
        }
        
        if (!name || !number || !dob || !password || !gender || !email || !photo) {
            return next(new MyErrorClass("Please fill all the necessary informations", 400));
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const userInfo = {
            name,
            number,
            dob: new Date(dob),
            email,
            password: hashedPassword,
            photo:photo.path,
            gender
        }


        // checking if user is already present or not
        const user = await UserModel.findOne({email});

        if (!user) {
            await UserModel.create(userInfo);

            return res.status(200).json({
                success: true,
                message: `${name}, your account has been created successfully 🌚`
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: `User already exists`
            });
        }
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const loginUser = async(req: Request<{}, {}, RequestUserLoginBody>, res: Response, next: NextFunction) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: `Please enter your email and password`
            });
        }

        // checking if user is already present or not
        const user = await UserModel.findOne({email});

        if (user) {
            const hasshedPassword = user.password;
            const ok = await bcrypt.compare(password, hasshedPassword);

            if (ok) {
                const token = jwt.sign({ _id: user._id }, "fjeivner");

                res.cookie("token", token, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                }).status(200).json({
                    success: true,
                    message: `Welcome ${user.name} 🌚!`,
                    user
                });
            }
            else {
                return res.status(401).json({
                    // 401 means unauthorized
                    success: false,
                    message: `Invalid Email or Password 😒!`
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                message: `No user exsits. Please register first`
            });
        }
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const logoutUser = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    return res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: `You have been logged out successfully 🙂!`
    });
}

export const getUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return next(new MyErrorClass("No User Selected", 404));
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const getAllUser = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const users = await UserModel.find({});

        return res.status(200).json({
            success: false,
            users
        })
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const deleteUser = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        
        if (!id) {
            return next(new MyErrorClass("You Cannot Delete Yourself", 404));
        }

        const loggedInUser = req.user?._id;

        if (id === loggedInUser) {
            return next(new MyErrorClass("You Cannot Delete Yourself", 404));
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return next(new MyErrorClass("No User found.", 400));
        }

        // delete the photo also.
        fs.rm(user.photo, () => {
            console.log("Photo Deleted Successfully");
        });

        // deleting all the comments, orders, feedback.
        const deleteOperations = [
            commentModel.deleteMany({
                user: id
            }),
            orderModel.deleteMany({
                user: user._id
            }),
            deletedOrderModel.deleteMany({
                user: user._id
            }),
            feedbackModel.deleteOne({
                user: user._id
            })
        ]
        await Promise.all(deleteOperations);

        await user.deleteOne(); // user deleted

        return res.status(200).json({
            success: false,
            message: "User Deleted successfully !"
        })
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

interface UpdateProfileInterface {
    name:string,
    number:number,
    dob: Date,
    email: string,
    password:string,
    gender: "Male" | "Female"
}
interface UserId {
    id: string
}
export const updateUser = async (req: Request<UserId, {}, UpdateProfileInterface>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new MyErrorClass("No User Selected", 404));
        }

        const user = await UserModel.findById(id);
    
        if (!user) {
            return next(new MyErrorClass("No User Found", 404));
        }

        const {
            name,
            number,
            dob,
            email,
            password,
            gender,
        } = req.body;

        const photo = req.file;

        if (name) {
            user.name = name;
        }

        if (number) {
            user.number = number;
        }

        if (dob) {
            user.dob = new Date(dob);
        }

        if (email) {
            user.email = email;
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        if (gender) {
            user.gender = gender;
        }

        if (photo) {
            if (user.photo) {
                fs.unlink(user.photo, (err) => {
                    if (err) console.log(err);
                });
            }
            user.photo = photo.path;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully"
        });
    } catch (error: any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}
