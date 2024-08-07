import { Helpers } from "./../../../shared/globals/helpers/helpers";
import {
  // IBasicInfo,
  // ISearchUser,
  IUserDocument,
  // ISocialLinks,
  // INotificationSettings,
} from "../interfaces/user.interface";
import { UserModel } from "../models/user.schema";
import mongoose from "mongoose";
import { indexOf } from "lodash";
import { AuthModel } from "../../../features/auth/models/auth.schema";

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async updatePassword(
    username: string,
    hashedPassword: string
  ): Promise<void> {
    await AuthModel.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    ).exec();
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserModel.findById(userId).select(
      "_id name email role"
    )) as IUserDocument;
    return user;
  }

  public async getUserByEmail(email: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserModel.findOne({
      email: Helpers.lowerCase(email),
    })
      .select("_id name email role")
      .exec()) as IUserDocument;
    return user;
  }
}

export const userService: UserService = new UserService();
