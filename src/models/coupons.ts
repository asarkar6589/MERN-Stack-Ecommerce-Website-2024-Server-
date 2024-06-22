import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the name for the coupon"],
        unique: true
    },
    discount: {
        type: Number,
        required: [true, "Please enter the discount amount for the coupon"]
    }
});

export const couponModel = mongoose.model("coupon", couponSchema);
