import HTTP_STATUS from "http-status-codes";
import Logger from "bunyan";
import http from "http";
import cors from "cors";
import compression from "compression";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import "express-async-errors";
import { Server as SocketServer } from "socket.io";
import cookieSession from "cookie-session";
import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from "express";
import { config } from "./config";
import applicationRoutes from "./routes";
import {
  CustomError,
  IErrorResponse,
} from "./shared/globals/helpers/error-handler";

const SERVER_PORT = 5600;
const log: Logger = config.createLogger("server");

export class Server {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set("trust proxy", 1);
    app.use(
      cookieSession({
        name: "session",
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== "development",
        // sameSite: 'none' //comment when running locally
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: "40mb" }));
    app.use(urlencoded({ extended: true, limit: "40mb" }));
  }

  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private async globalErrorHandler(app: Application): Promise<void> {
    app.all("*", (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: `${req.originalUrl} not found` });
    });

    app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(error);
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        next();
      }
    );
  }

  private async startServer(app: Application): Promise<void> {
    if (!config.JWT_TOKEN) {
      throw new Error("JWT_TOKEN must be provided!");
    }

    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: SocketServer = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<SocketServer> {
    const io: SocketServer = new SocketServer(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Worker with process id of ${process.pid} has started`);
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: SocketServer): void {
    //TODO: Implement socket io connections here
  }
}
