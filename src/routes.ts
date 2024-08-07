import { authRoutes } from "./features/auth/routes/authRoutes";
import { Application } from "express";
import { sellerRoutes } from "./features/seller/routes/sellerRoutes";

const BASE_PATH = "/api/v1";

export default (app: Application) => {
  const routes = () => {
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, sellerRoutes.routes());
  };

  routes();
};
