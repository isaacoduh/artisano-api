import { config } from "./../../../config";
import JWT from "jsonwebtoken";
import { AuthPayload } from "./../../../features/auth/interfaces/auth.interface";
import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "./error-handler";

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError(
        "Token is not avialble. Please login again."
      );
    }

    try {
      const payload: AuthPayload = JWT.verify(
        req.session?.jwt,
        config.JWT_TOKEN!
      ) as AuthPayload;

      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError("Token is invalid. Please login again");
    }
    next();
  }

  public checkAuthentication(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError(
        "Authentication is required to access this route!"
      );
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
