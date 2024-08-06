import { IAuthDocument, IBaseAuthUser } from "../interfaces/auth.interface";
import { AuthModel } from "../models/auth.schema";
import { UserModel } from "../../user/models/user.schema";
import { Helpers } from "../../../shared/globals/helpers/helpers";
import { IUserDocument } from "src/features/user/interfaces/user.interface";

class AuthService {
  public async getUserByEmail(email: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserModel.findOne({
      email: Helpers.lowerCase(email),
    })
      .select("_id name email role")
      .exec()) as IUserDocument;

    return user;
  }
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  public async updatePasswordToken(
    authId: string,
    token: string,
    tokenExpiration: number
  ): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration,
      }
    );
  }
  public async getUserByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: Helpers.lowerCase(email) },
      ],
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query
    ).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Helpers.lowerCase(email),
    }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByPasswordToken(
    token: string
  ): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).exec()) as IAuthDocument;
    return user;
  }
}
export const authService: AuthService = new AuthService();
