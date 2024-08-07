import { authMiddleware } from "./../../../shared/globals/helpers/auth-middleware";
import express, { Router } from "express";
import { SellerController } from "../controllers/seller.controller";

class SellerRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post(
      "/seller/create",
      authMiddleware.verifyUser,
      authMiddleware.checkAuthentication,
      SellerController.prototype.createSeller
    );

    this.router.get("/seller/:id", SellerController.prototype.getSellerInfo);

    return this.router;
  }
}

export const sellerRoutes: SellerRoutes = new SellerRoutes();
