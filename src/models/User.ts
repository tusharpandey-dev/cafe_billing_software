import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    plainPassword: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "waiter", "kitchen"],
      required: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    restaurantId: {
      type: String,
      default: "default-restaurant",
    },
    branchId: {
      type: String,
      default: "default-branch",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deviceId: {
      type: String,
      default: "",
    },
    deviceName: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ username: 1 });
UserSchema.index({ mobile: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ restaurantId: 1, branchId: 1 });

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

