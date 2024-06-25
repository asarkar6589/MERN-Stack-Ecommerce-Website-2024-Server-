import bcrypt from "bcrypt";
import crypto from "crypto";
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
import getDataUri from "../utils/dataURI.js";
import cloudinary from "cloudinary";
import { sendEmail } from "../utils/sendEmail.js";

export const newUser = async (
  req: Request<{}, {}, RequestUserBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, number, dob, email, password, gender } = req.body;

    const photo = req.file;

    if (!photo) {
      return next(new MyErrorClass("Please provide a photo", 400));
    }

    const fileUri = getDataUri(photo);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content!);

    if (!name || !number || !dob || !password || !gender || !email || !photo) {
      return next(
        new MyErrorClass("Please fill all the necessary informations", 400)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const upload: any = await cloudinaryImageUploadMethod(photo.path);

    const userInfo = {
      name,
      number,
      dob: new Date(dob),
      email,
      password: hashedPassword,
      gender,
      photo: myCloud.secure_url,
    };

    // checking if user is already present or not
    const user = await UserModel.findOne({ email });

    if (!user) {
      await UserModel.create(userInfo);

      return res.status(200).json({
        success: true,
        message: `${name}, your account has been created successfully 🌚`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `User already exists`,
      });
    }
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

export const loginUser = async (
  req: Request<{}, {}, RequestUserLoginBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please enter your email and password`,
      });
    }

    // checking if user is already present or not
    const user = await UserModel.findOne({ email });

    if (user) {
      const hasshedPassword = user.password;
      const ok = await bcrypt.compare(password, hasshedPassword);

      if (ok) {
        const token = jwt.sign({ _id: user._id }, "fjeivner");

        res
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .status(200)
          .json({
            success: true,
            message: `Welcome ${user.name} 🌚!`,
            user,
          });
      } else {
        return res.status(401).json({
          // 401 means unauthorized
          success: false,
          message: `Invalid Email or Password 😒!`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `No user exsits. Please register first`,
      });
    }
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  return res
    .cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: `You have been logged out successfully 🙂!`,
    });
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return next(new MyErrorClass("No User Selected", 404));
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await UserModel.find({});

    return res.status(200).json({
      success: false,
      users,
    });
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

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
        user: id,
      }),
      orderModel.deleteMany({
        user: user._id,
      }),
      deletedOrderModel.deleteMany({
        user: user._id,
      }),
      feedbackModel.deleteOne({
        user: user._id,
      }),
    ];
    await Promise.all(deleteOperations);

    await user.deleteOne(); // user deleted

    return res.status(200).json({
      success: false,
      message: "User Deleted successfully !",
    });
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

interface UpdateProfileInterface {
  name: string;
  number: number;
  dob: Date;
  email: string;
  password: string;
  gender: "Male" | "Female";
}
interface UserId {
  id: string;
}
export const updateUser = async (
  req: Request<UserId, {}, UpdateProfileInterface>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new MyErrorClass("No User Selected", 404));
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return next(new MyErrorClass("No User Found", 404));
    }

    const { name, number, dob, email, password, gender } = req.body;

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

    const photo = req.file;
    if (photo) {
      const fileUri = getDataUri(photo);
      const myCloud = await cloudinary.v2.uploader.upload(fileUri.content!);
      user.photo = myCloud.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
    });
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return next(new MyErrorClass("No user is found with this email", 404));
    }

    const resetToken = await user.getResetToken();

    await user.save(); // we have to save the token,the moment anyone clicks on the forget password link.

    // url = http://localhost:5173/resetpassword/skwwwl -> we will get the token from the url
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message: string = `Click on the link to reset your password. ${url} If you have not requested this, then please ignore.`;

    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      text: message,
    });

    return res.status(200).json({
      sucess: true,
      message: `Email sent to ${email}`,
    });
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
  
    Now we have sent this link to the user : 
    
    http://localhost:5173/resetpassword/4272e8b8dd44f58fd9ef309f160d83a2dd38a395

    Now we will use the token at the last of the link and make request to the backend, that is wether the token provided is valid or not. If it is valid, then only we will allow the user to reset the password.
  
  */

  try {
    const { token } = req.params;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return next(
        new MyErrorClass("Token is invalid or has been expired.", 401)
      );
    }

    // update the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;

    // now the monent we update the password, we have to set 2 things to undefined
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    return res.status(200).json({
      sucess: true,
      message: `Password changed successfully`,
      token,
    });
  } catch (error: any) {
    return next(
      new MyErrorClass(error.message || "Internal Server Error", 500)
    );
  }
};
