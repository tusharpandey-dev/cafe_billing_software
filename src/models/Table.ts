import mongoose, { Schema } from "mongoose";

const TableSchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

TableSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

TableSchema.set("toJSON", {
  virtuals: true,
});

export const TableModel = mongoose.models.Table || mongoose.model("Table", TableSchema);
