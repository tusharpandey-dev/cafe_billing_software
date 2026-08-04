import mongoose, { Schema } from "mongoose";

const MenuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    veg: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    emoji: {
      type: String,
      default: "🍽️",
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual 'id' mapping to '_id' for frontend compatibility if needed,
// but since we can just do mapping in serialization or use virtuals:
MenuItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

MenuItemSchema.set("toJSON", {
  virtuals: true,
});

export const MenuItemModel = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
