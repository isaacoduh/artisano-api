import { authMiddleware } from "./../../../shared/globals/helpers/auth-middleware";
import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post("/register", AuthController.prototype.register);
    this.router.post("/login", AuthController.prototype.signin);
    this.router.get(
      "/currentuser",
      authMiddleware.verifyUser,
      authMiddleware.checkAuthentication,
      AuthController.prototype.getCurrentUser
    );
    this.router.get("/signout", AuthController.prototype.signout);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
