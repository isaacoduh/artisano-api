import { Document } from "mongoose";
import { ObjectId } from "mongodb";
import { IUserDocument } from "src/features/user/interfaces/user.interface";

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
}

export interface IBaseAuthUser extends Document {
  _id: string | ObjectId;
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  name: string;
  email: string;
  role: string;
  password: string;
  // avatarColor: string;
}

// export interface AuthPayload {
//   userId: string;
//   uId: string;
//   email: string;
//   username: string;
//   avatarColor: string;
//   iat?: number;
// }

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
