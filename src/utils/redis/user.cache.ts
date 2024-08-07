import { BaseCache } from "./base.cache";
import {
  // INotificationSettings,
  // ISocialLinks,
  IUserDocument,
} from "../../features/user/interfaces/user.interface";
import Logger from "bunyan";
import { indexOf, findIndex } from "lodash";
import { config } from "../../config";
import { ServerError } from "../../shared/globals/helpers/error-handler";
import { RedisCommandRawReply } from "@redis/client/dist/lib/commands";
import { Helpers } from "../../shared/globals/helpers/helpers";

const log: Logger = config.createLogger("userCache");
// type UserItem = string | ISocialLinks | INotificationSettings;
type UserCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply[]
  | IUserDocument
  | IUserDocument[];

export class UserCache extends BaseCache {
  constructor() {
    super("userCache");
  }

  public async saveUserToCache(
    key: string,
    userUId: string,
    createdUser: IUserDocument
  ): Promise<void> {
    const createdAt = new Date();
    const { _id, uId, name, email, role } = createdUser;
    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      name: `${name}`,
      email: `${email}`,
      role: `${role}`,
      createdAt: `${createdAt}`,
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD("user", {
        score: parseInt(userUId, 10),
        value: `${key}`,
      });

      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError("Server Error. Try again");
    }
    // const {
    //   _id,
    //   uId,
    //   username,
    //   email,
    //   avatarColor,
    //   blocked,
    //   blockedBy,
    //   postsCount,
    //   profilePicture,
    //   followersCount,
    //   followingCount,
    //   notifications,
    //   work,
    //   location,
    //   school,
    //   quote,
    //   bgImageId,
    //   bgImageVersion,
    //   social,
    // } = createdUser;
    // const dataToSave = {
    //   _id: `${_id}`,
    //   uId: `${uId}`,
    //   username: `${username}`,
    //   email: `${email}`,
    //   avatarColor: `${avatarColor}`,
    //   createdAt: `${createdAt}`,
    //   postsCount: `${postsCount}`,
    //   blocked: JSON.stringify(blocked),
    //   blockedBy: JSON.stringify(blockedBy),
    //   profilePicture: `${profilePicture}`,
    //   followersCount: `${followersCount}`,
    //   followingCount: `${followingCount}`,
    //   notifications: JSON.stringify(notifications),
    //   social: JSON.stringify(social),
    //   work: `${work}`,
    //   location: `${location}`,
    //   school: `${school}`,
    //   quote: `${quote}`,
    //   bgImageVersion: `${bgImageVersion}`,
    //   bgImageId: `${bgImageId}`,
    // };
    // try {
    //   if (!this.client.isOpen) {
    //     await this.client.connect();
    //   }
    //   await this.client.ZADD("user", {
    //     score: parseInt(userUId, 10),
    //     value: `${key}`,
    //   });
    //   for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
    //     await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
    //   }
    // } catch (error) {
    //   log.error(error);
    //   throw new ServerError("Server Error. Try again");
    // }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      console.log(userId);

      const response: IUserDocument = (await this.client.HGETALL(
        `users:${userId}`
      )) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server Error. Try again");
    }
  }
}
