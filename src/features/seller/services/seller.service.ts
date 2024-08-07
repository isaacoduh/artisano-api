import { userService } from "./../../user/services/user.service";
import { ISellerDocument } from "../interfaces/seller.interface";
import { SellerModel } from "../models/seller.schema";

class SellerService {
  public async getSellerByUserId(userId: string): Promise<ISellerDocument> {
    const seller: ISellerDocument = (await SellerModel.findOne({
      userId: userId,
    }).exec()) as ISellerDocument;
    return seller;
  }

  public async getSellerById(id: string): Promise<ISellerDocument> {
    const seller: ISellerDocument = (await SellerModel.findById(
      id
    )) as ISellerDocument;
    return seller;
  }

  public async create(data: ISellerDocument): Promise<ISellerDocument> {
    const createdSeller: ISellerDocument = (await SellerModel.create(
      data
    )) as ISellerDocument;
    await userService.updateUserToSeller(`${createdSeller.userId}`);
    return createdSeller;
  }
}

export const sellerService: SellerService = new SellerService();
