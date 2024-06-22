import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the name of the product"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter the stock of the product"],
        min: 0
    },
    price: {
        type: Number,
        required: [true, "Please enter the quantity of the product"]
    },
    photo: {
        type: String,
        required: [true, "Please enter the photo of the product"]
    },
    description: {
        type: String,
        required: [true, "Please enter the description of the product"]
    },
    category: {
        type: String,
        required: [true, "Please enter the name of the product"]
    },
    brand: {
        type: String,
        required: [true, "Please enter the brand of the product"]
    }
}, {
    timestamps: true,
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;
