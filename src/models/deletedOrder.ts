import mongoose from "mongoose";

const deletedOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please Enter the user"]
    },
    product: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Please Enter the product id"]
            },
            name: {
                type: String,
                required: [true, "Please Enter the name of the product"]
            },
            quantity: {
                type: Number,
                default: 1,
                require: [true, "Please Enter the quantity"]
            },
            price: {
                type: Number,
                required: [true, "Please Enter the price of the product"]
            },
            photo: {
                type: String,
                required: [true, "Please Enter the photo of the product"]
            }
        }
    ],
    discount: {
        type: Number,
        default: 0,
        required: [true, "Please Enter the discount amount"]
    },
    subTotal: { 
        type: Number,
        required: [true, "Please Enter the subTotal"]
    },
    shippingCharges: {
        type: Number,
    },
    tax: {
        type: Number,
        required: [true, "Please Enter the tax"]
    },
    total: {
        type: Number,
        required: [true, "Please Enter the total money"]
    },
    shippingAddress: {
        address: {
            type: String,
            required: [true, "Please Enter the address"]
        },
        city: {
            type: String,
            required: [true, "Please Enter the city"]
        },
        country: {
            type: String,
            required: [true, "Please Enter the country"]
        },
        pinCode: {
            type: Number,
            required: [true, "Please Enter the number"]
        }
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Deliverd"],
        default: "Processing"
    },
    refundStatus: {
        type: String,
        enum: ["Processing", "Refunded"],
        default: "Processing"
    }
}, {
    timestamps: true
});

export const deletedOrderModel = mongoose.model("DeletedOrder", deletedOrderSchema);
