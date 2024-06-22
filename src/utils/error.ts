import { NextFunction, Request, Response } from "express";

class MyErrorClass extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err: MyErrorClass, req: Request, res: Response, next: NextFunction) => {
    const myError = new MyErrorClass(err.message, err.statusCode);

    myError.message = myError.message || "Internal Server Error";
    myError.statusCode = myError.statusCode || 500;

    if(myError.name === "CastError") {
        myError.message = "Invalid Id";
    }

    return res.status(myError.statusCode).json({
        success: false,
        message: myError.message
    });
};

export default MyErrorClass;