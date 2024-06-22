import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please Enter the user"]
    },
    rating: {
        type: Number,
        required: [true, "Please your rating"]
    },
    feedback: {
        type: String,
        required: [true, "Please enter your feedback"]
    }
});

export const feedbackModel = mongoose.model("feedback", feedbackSchema);
