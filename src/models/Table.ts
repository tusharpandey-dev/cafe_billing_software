import mongoose, { Schema } from "mongoose";

const TableSchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
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

TableSchema.index({ number: 1, restaurantId: 1, branchId: 1 }, { unique: true });

TableSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

TableSchema.set("toJSON", {
  virtuals: true,
});

export const TableModel = mongoose.models.Table || mongoose.model("Table", TableSchema);
