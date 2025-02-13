import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    photo_url: { type: String, required: flase, nullable: true },
    dob: { type: Date, default: null },
    isAdmin: { type: Boolean, default: false },
    lastLoginDate: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpireAt: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpireAt: { type: Date },
  },
  { timestamps: true }
);

// Tạo mô hình Mongoose từ schema
const User = mongoose.model("User", userSchema);

// Xuất mô hình
export default User;
