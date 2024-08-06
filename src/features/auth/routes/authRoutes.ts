import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post("/register", AuthController.prototype.register);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
