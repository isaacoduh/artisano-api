import mongoose, { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface ISellerDocument {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  shopName: string;
  contactInfo: string;
  createdAt?: Date | string;
}
