import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    court: { type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
