import mongoose, { Document, Schema, Model } from "mongoose";

interface Comment extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    title: string;
    description: string;
}

// 51tnkv1D6Wiaoagi   ecommerce

const commentSchema = new Schema<Comment>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please Enter the title of your comment"]
    },
    description: {
        type: String,
        required: [true, "Please Enter the description of your comment"]
    }
}, {
    timestamps: true,
});

// Create a compound index on user and product fields to enforce uniqueness
// commentSchema.index({ user: 1, product: 1 }, { unique: true });

export const commentModel = mongoose.model<Comment>('Comment', commentSchema);
