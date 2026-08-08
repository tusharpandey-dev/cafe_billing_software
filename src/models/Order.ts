import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  veg: { type: Boolean, required: true },
  description: { type: String, default: "" },
  emoji: { type: String, default: "🍽️" },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "completed"],
      required: true,
      default: "pending",
    },
    waiter: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentOrderId: {
      type: String,
      default: "",
    },
    paymentSignature: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    restaurantId: {
      type: String,
      default: "default-restaurant",
    },
    branchId: {
      type: String,
      default: "default-branch",
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);

