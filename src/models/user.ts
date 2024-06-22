import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
    _id: string,
    name: string,
    email: string,
    password: string,
    photo: string,
    number: number,
    role: "Admin" | "User",
    gender: "Male"| "Female",
    dob: Date,
    createdAt: Date, // Because of timestamps, this will also come.
    updatedAt: Date // Because of timestamps, this will also come.
    age: number // virtual attribute.
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    number: {
        type: Number,
        required: [true, "Please enter your mobile number"]
    },
    dob: {
        type: Date,
        required: [true, "Please enter your dob"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: validator.isEmail,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"]
    },
    photo: {
        type: String,
        required: [true, "Please enter your photo"]
    }, 
    gender: {
        type: String,
        enum: ["Male", "Female", "Others"],
        required: [true, "Please enter your gender"]
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    }
}, {
    timestamps: true
});

userSchema.virtual("age").get(function() {
    const today = new Date();
    const dob = this.dob; // here this means the schema itself
    let age = today.getFullYear() - dob.getFullYear();

    if ((today.getMonth() < dob.getMonth()) || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        /*
        
            If the today month is Feb and dob month is Oct, then ther user has not yet completed his age, so in that case we will decrease the age. 

            For the second condition, if the month is same, then we will compare the dates. For date also the same concept will beused as that for the months.
        
        */

        age--;
    }

    return age;
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
