import mongoose from "mongoose";

const courtSchema = new mongoose.Schema(
  {
    court_name: { type: String, required: true },
    price: { type: Number, required: true },
    court_photo: { type: String, default: null },
    status: { type: String, enum: ["available", "booked", "maintenance"], default: "available" },
  },
  { timestamps: true }
);

export default mongoose.model("Court", courtSchema);
