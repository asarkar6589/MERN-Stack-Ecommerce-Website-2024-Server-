import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import express, { Response } from "express";
import Stripe from "stripe";
import CommentRouter from "./routes/comments.js";
import CouponRouter from "./routes/coupon.js";
import DeletedOrder from "./routes/deletedOrder.js";
import FeedbackRouter from "./routes/feedback.js";
import OrderRouter from "./routes/order.js";
import PayementRouter from "./routes/payement.js";
import ProductRouter from "./routes/product.js";
import StatsRouter from "./routes/stats.js";
import UserRouter from "./routes/user.js";
import { connectDataBase } from "./utils/connectDb.js";
import { errorMiddleware } from "./utils/error.js";

// env setup
dotenv.config({
  path: ".env",
});

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const port_number: number = Number(process.env.PORT_NUMBER)!;
const url: string = process.env.MONGO_URL!;
const stripeKey = process.env.STRIPE_KEY!;

export const stripe = new Stripe(stripeKey);

const app = express();
connectDataBase({ url });

app.use(express.json()); // to get the data from body
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser()); // to get the value of token from cookie
app.use(
  express.urlencoded({
    extended: false,
  })
);

// router middlewares
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/comment", CommentRouter);
app.use("/api/v1/coupon", CouponRouter);
app.use("/api/v1/order", OrderRouter);
app.use("/api/v1/pay", PayementRouter);
app.use("/api/v1/order/canceled", DeletedOrder);
app.use("/api/v1/stats", StatsRouter);
app.use("/api/v1/feedback", FeedbackRouter);

// multer middleware
app.use("/uploads", express.static("uploads"));
/*

So we have successfully uploaded our image using multer in our folder, but there is one problem, the link to the image is :
"http://localhost:5000/uploads/macbook-air-midnight-gallery1-20220606.jpg"

When we write this url in our browser, it shows error that is cannot get request. So we have to make this folder static so that the browser doesnot treat this as an API.

*/

app.use(errorMiddleware);

app.get("/", (req, res: Response) => {
  res.json("Server Working");
});

app.listen(port_number, () => {
  console.log(`Server is working on ${port_number}`);
});
