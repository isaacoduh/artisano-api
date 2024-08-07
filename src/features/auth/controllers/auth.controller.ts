import HTTP_STATUS from "http-status-codes";
import { userQueue } from "./../../../utils/queues/user.queue";
import { authQueue } from "./../../../utils/queues/auth.queue";
import { UserCache } from "./../../../utils/redis/user.cache";
import { IUserDocument } from "./../../user/interfaces/user.interface";
import { Helpers } from "./../../../shared/globals/helpers/helpers";
import { BadRequestError } from "./../../../shared/globals/helpers/error-handler";
import { authService } from "./../services/auth.service";
import { IAuthDocument, ISignUpData } from "./../interfaces/auth.interface";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { joiValidation } from "../../../shared/globals/decorators/joi-validation.decorator";
import { signupSchema } from "../schemas/signup";
import { UploadApiResponse } from "cloudinary";
import { uploads } from "src/shared/globals/helpers/cloudinary-upload";
import JWT from "jsonwebtoken";
import { config } from "../../../config";
import { userService } from "../../../features/user/services/user.service";
import { loginSchema } from "../schemas/signin";

const userCache: UserCache = new UserCache();

export class AuthController {
  @joiValidation(signupSchema)
  public async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;
    const checkIfUserExist: IUserDocument = await authService.getUserByEmail(
      email
    );
    if (checkIfUserExist) {
      throw new BadRequestError("User with email already exists");
    }

    const uId = `${Helpers.generateRandomIntegers(12)}`;

    const userObjectId: ObjectId = new ObjectId();

    const signupData: ISignUpData = {
      _id: userObjectId,
      uId,
      name,
      email,
      role: "customer",
      password,
    };

    const authData: IUserDocument = AuthController.prototype.signupData({
      _id: userObjectId,
      uId,
      name,
      email,
      role: "customer",
      password,
    });

    // add to redis
    const userDataForCache: IUserDocument =
      AuthController.prototype.userData(authData);
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // add to database

    userQueue.addUserJob("addUserToDB", { value: userDataForCache });

    // const userToSave: IUserDocument =
    //   AuthController.prototype.userData(signupData);

    // const result = await userService.addUserData(userToSave);

    const userJWT: string =
      AuthController.prototype.signToken(userDataForCache);

    req.session = { jwt: userJWT };

    res.status(HTTP_STATUS.CREATED).json({
      message: "User Created Successfully",
      user: userDataForCache,
      token: userJWT,
    });
  }

  @joiValidation(loginSchema)
  public async signin(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const existingUser: IUserDocument = await userService.getUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError("Invalid Credentials");
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(
      password,
      existingUser.password!
    );

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    const user: IUserDocument = await userService.getUserById(
      `${existingUser._id}`
    );

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        role: existingUser.role,
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    // const userDocument: IUserDocument = { user } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({
      message: "User login successful",
      user: user,
      token: userJwt,
    });
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser: IUserDocument = (await userCache.getUserFromCache(
      `${req.currentUser?.userId}`
    )) as IUserDocument;

    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser?.userId}`);

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }

  public async signout(req: Request, res: Response): Promise<void> {
    req.session = null;
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Logout successful", user: {}, token: "" });
  }

  private signupData(data: ISignUpData): IUserDocument {
    const { _id, uId, name, email, password } = data;
    return {
      _id,
      uId,
      name,
      email: Helpers.lowerCase(email),
      password,
      createdAt: new Date(),
    } as unknown as IUserDocument;
  }

  private userData(data: IUserDocument): IUserDocument {
    const { _id, name, email, role, password, uId } = data;
    return {
      _id,
      uId,
      name,
      email,
      password,
      role: "customer",
    } as unknown as IUserDocument;
  }

  private signToken(data: IUserDocument): string {
    return JWT.sign(
      { userId: data._id, email: data.email, role: data.role },
      config.JWT_TOKEN!
    );
  }

  // @joiValidation(signupSchema)
  // public async create(req: Request, res: Response): Promise<void> {
  //   const { username, email, password, avatarColor, avatarImage } = req.body;

  //   // Auth Service to get a user
  //   const checkIfUserExist: IAuthDocument =
  //     await authService.getUserByUsernameOrEmail(username, email);
  //   if (checkIfUserExist) {
  //     throw new BadRequestError("Invalid credentials");
  //   }

  //   const authObjectId: ObjectId = new ObjectId();
  //   const userObjectId: ObjectId = new ObjectId();

  //   const uId = `${Helpers.generateRandomIntegers(12)}`;

  //   const authData: IAuthDocument = AuthController.prototype.signupData({
  //     _id: authObjectId,
  //     uId,
  //     username,
  //     email,
  //     password,
  //     avatarColor,
  //   });

  //   const result: UploadApiResponse = (await uploads(
  //     avatarImage,
  //     `${userObjectId}`,
  //     true,
  //     true
  //   )) as UploadApiResponse;
  //   if (!result?.public_id) {
  //     throw new BadRequestError("File upload: Error occured. Try again!");
  //   }

  //   // add to redis cache
  //   const userDataForCache: IUserDocument = AuthController.prototype.userData(
  //     authData,
  //     userObjectId
  //   );
  //   userDataForCache.profilePicture = `https://res.cloudinary.com/fdaeaga/image/upload/v${result.version}/${userObjectId}`;
  //   await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

  //   // add to database
  //   authQueue.addAuthUserJob("addAuthUserToDB", { value: authData });
  //   userQueue.addUserJob("addUserToDB", { value: userDataForCache });

  //   const userJwt: string = AuthController.prototype.signToken(
  //     authData,
  //     userObjectId
  //   );
  //   req.session = { jwt: userJwt };
  //   res.status(HTTP_STATUS.CREATED).json({
  //     message: "User Created Successfully",
  //     user: userDataForCache,
  //     token: userJwt,
  //   });
  // }

  // private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
  //   return JWT.sign(
  //     {
  //       userId: userObjectId,
  //       uId: data.uId,
  //       email: data.email,
  //       username: data.username,
  //       avatarColor: data.avatarColor,
  //     },
  //     config.JWT_TOKEN!
  //   );
  // }

  // private signupData(data: ISignUpData): IAuthDocument {
  //   const { _id, username, email, uId, password, avatarColor } = data;
  //   return {
  //     _id,
  //     uId,
  //     username: Helpers.firstLetterUppercase(username),
  //     email: Helpers.lowerCase(email),
  //     password,
  //     avatarColor,
  //     createdAt: new Date(),
  //   } as IAuthDocument;
  // }

  // private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
  //   const { _id, username, email, uId, password, avatarColor } = data;
  //   return {
  //     _id: userObjectId,
  //     authId: _id,
  //     uId,
  //     username: Helpers.firstLetterUppercase(username),
  //     email,
  //     password,
  //     avatarColor,
  //     profilePicture: "",
  //     blocked: [],
  //     blockedBy: [],
  //     work: "",
  //     location: "",
  //     school: "",
  //     quote: "",
  //     bgImageVersion: "",
  //     bgImageId: "",
  //     followersCount: 0,
  //     followingCount: 0,
  //     postsCount: 0,
  //     notifications: {
  //       messages: true,
  //       reactions: true,
  //       comments: true,
  //       follows: true,
  //     },
  //     social: {
  //       facebook: "",
  //       instagram: "",
  //       twitter: "",
  //       youtube: "",
  //     },
  //   } as unknown as IUserDocument;
  // }
}
