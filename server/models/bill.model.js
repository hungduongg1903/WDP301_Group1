import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    rental_price: { type: Number, required: true },
    time_rental: { type: Date, required: true },
    status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
    court: { type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
