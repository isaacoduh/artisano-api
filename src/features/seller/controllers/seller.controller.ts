import HTTP_STATUS from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
} from "./../../../shared/globals/helpers/error-handler";
import { Request, Response } from "express";
import { joiValidation } from "../../../shared/globals/decorators/joi-validation.decorator";
import { ISellerDocument } from "../interfaces/seller.interface";
import { createSellerSchema } from "../schemas/create";
import { sellerService } from "../services/seller.service";

export class SellerController {
  @joiValidation(createSellerSchema)
  public async createSeller(req: Request, res: Response): Promise<void> {
    const { shopName, contactInfo } = req.body;
    // check if user has a store already
    const sellerExists: ISellerDocument = await sellerService.getSellerByUserId(
      `${req.currentUser?.userId}`
    );

    if (sellerExists) {
      throw new BadRequestError("Seller already exists for this user.");
    }

    const sellerData: ISellerDocument = {
      userId: `${req.currentUser?.userId}`,
      contactInfo,
      shopName,
    };

    const seller: ISellerDocument = await sellerService.create(sellerData);

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Seller Created Successfully", seller: seller });
  }

  public async getSellerInfo(req: Request, res: Response): Promise<void> {
    const sellerInfo: ISellerDocument = await sellerService.getSellerById(
      `${req.params.id}`
    );

    if (!sellerInfo) {
      throw new NotFoundError("Seller Profile Not Found");
    }

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Seller Profile", seller: sellerInfo });
  }
}
