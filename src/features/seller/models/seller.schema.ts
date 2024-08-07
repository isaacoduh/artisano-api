import { ObjectId } from "mongodb";
import mongoose, { Model, Schema, model } from "mongoose";
import { ISellerDocument } from "../interfaces/seller.interface";

const sellerSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: { type: String, required: true },
    contactInfo: { type: String, required: true },
  },
  { timestamps: true }
);

const SellerModel: Model<ISellerDocument> = model<ISellerDocument>(
  "Seller",
  sellerSchema,
  "Seller"
);
export { SellerModel };

//       userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   shopName: { type: String, required: true },
//   shopPolicies: { shipping: String, returns: String },
//   contactInfo: { type: String, default: '' },
//   products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
//   ratings: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number, comment: String }],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
