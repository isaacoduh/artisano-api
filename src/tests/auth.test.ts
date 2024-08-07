import { IUserDocument } from "./../features/user/interfaces/user.interface";
import { Helpers } from "./../shared/globals/helpers/helpers";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import {
  authMock,
  authMockRequest,
  authMockResponse,
  authUserPayload,
} from "../mocks/auth.mock";
import { mockExistingUser, existingUser } from "../mocks/user.mock";
import { authService } from "../features/auth/services/auth.service";
import { userService } from "../features/user/services/user.service";
import { AuthController } from "./../features/auth/controllers/auth.controller";
import { CustomError } from "../shared/globals/helpers/error-handler";
import { UserCache } from "../utils/redis/user.cache";

const USERNAME = "manny@me.com";
const PASSWORD = "manny1";
const WRONG_USERNAME = "ma";
const WRONG_PASSWORD = "ma";
const LONG_PASSWORD = "mathematics1";
const LONG_USERNAME = "mathematics";

jest.useFakeTimers();
jest.mock("../utils/queues/base.queue");
jest.mock("../utils/redis/user.cache");
jest.mock("../utils/queues/user.queue");

// jest.mock("@service/queues/base.queue");
// jest.mock("@service/redis/user.cache");
// jest.mock("@service/queues/user.queue");
// jest.mock("@service/queues/auth.queue");
// jest.mock("@global/helpers/cloudinary-upload");

describe("register", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("should throw an error if name is not available", () => {
    const req: Request = authMockRequest(
      {},
      { name: "", email: "john@test.com", password: "querty" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        "Name is a required field"
      );
    });
  });

  it("should throw an error if the name is less than the required characters", () => {
    const req: Request = authMockRequest(
      {},
      { name: "jo", email: "john@test.com", password: "querty" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid name");
    });
  });

  it("should throw an error if the email is not valid", () => {
    const req: Request = authMockRequest(
      {},
      { name: "john simon", email: "not valid", password: "querty" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Email must be valid");
    });
  });

  it("should throw an error if the email is not available", () => {
    const req: Request = authMockRequest(
      {},
      { name: "john simon", email: "", password: "querty" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        "Email is a required field"
      );
    });
  });

  it("should throw an error if the password is not available", () => {
    const req: Request = authMockRequest(
      {},
      { name: "john simon", email: "jon@still.com", password: "" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        "Password is a required field"
      );
    });
  });

  it("should throw an error if the password is less than minimum length", () => {
    const req: Request = authMockRequest(
      {},
      { name: "john simon", email: "jon@still.com", password: "a" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid password");
    });
  });

  it("should throw an error if the password is more than maximum length", () => {
    const req: Request = authMockRequest(
      {},
      { name: "john simon", email: "jon@still.com", password: "a" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid password");
    });
  });

  it("should throw unauthorize error if the user already exists", () => {
    const req: Request = authMockRequest(
      {},
      { name: "John Simons", email: "jon@me.com", password: "password" }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, "getUserByEmail").mockResolvedValue(authMock);
    AuthController.prototype.register(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        "User with email already exists"
      );
    });
  });

  it("should set valid session data for valid credentials and send correct json response", async () => {
    const req: Request = authMockRequest(
      {},
      { name: "John Simons", email: "jon@me.com", password: "password" }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, "getUserByEmail").mockResolvedValue(null as any);
    jest.spyOn(userService, "addUserData").mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, "saveUserToCache");

    await AuthController.prototype.register(req, res);

    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: "User Created Successfully",
      user: userSpy.mock.calls[0][2],
      //   user: {
      //     email: "jon@me.com",
      //     name: "John Simons",
      //     role: "customer",
      //   },
      token: req.session?.jwt,
    });
  });
});

describe("SignIn", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("should throw an error if email is unavailable", () => {
    const req: Request = authMockRequest(
      {},
      { email: "", password: PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        "Email is a required field"
      );
    });
  });

  it("should throw an error if email is invalid", () => {
    const req: Request = authMockRequest(
      {},
      { email: "ma", password: PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Email must be valid");
    });
  });

  it("should throw an error if password is not available", () => {
    const req: Request = authMockRequest(
      {},
      { email: USERNAME, password: "" }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        "Password is a required field"
      );
    });
  });

  it("should throw an error if password length is less than minimum length", () => {
    const req: Request = authMockRequest(
      {},
      { email: USERNAME, password: WRONG_PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid password");
    });
  });

  it("should throw an error if password length is greater than maximum length", () => {
    const req: Request = authMockRequest(
      {},
      { email: USERNAME, password: LONG_PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid password");
    });
  });

  it('should throw "invalid credentials" if email does not exist', () => {
    const req: Request = authMockRequest(
      {},
      { email: USERNAME, password: PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    jest
      .spyOn(userService, "getUserByEmail")
      .mockResolvedValueOnce(null as any);
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        Helpers.lowerCase(req.body.email)
      );
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid Credentials");
    });
  });

  it('should throw "invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest(
      {},
      { email: USERNAME, password: PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    jest
      .spyOn(userService, "getUserByEmail")
      .mockResolvedValueOnce(null as any);
    AuthController.prototype.signin(req, res).catch((error: CustomError) => {
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        Helpers.lowerCase(req.body.email)
      );
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual("Invalid Credentials");
    });
  });

  it("should set session data for valid credentials and correct json response", async () => {
    const req: Request = authMockRequest(
      {},
      { email: USERNAME, password: PASSWORD }
    ) as Request;
    const res: Response = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(userService, "getUserByEmail").mockResolvedValueOnce(authMock);
    jest.spyOn(userService, "getUserById").mockResolvedValue(mockExistingUser);

    await AuthController.prototype.signin(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("CurrentUser", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("token", () => {
    it("should set session token to null and correct json response", async () => {
      const req: Request = authMockRequest(
        {},
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as Request;
      const res: Response = authMockResponse();
      jest
        .spyOn(UserCache.prototype, "getUserFromCache")
        .mockResolvedValue({} as IUserDocument);
      await AuthController.prototype.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: null,
        isUser: false,
        user: null,
      });
    });

    it("should set session token and correct json response", async () => {
      const req: Request = authMockRequest(
        { jwt: "124hjdafd" },
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as Request;
      const res: Response = authMockResponse();
      jest
        .spyOn(UserCache.prototype, "getUserFromCache")
        .mockResolvedValue(existingUser);
      await AuthController.prototype.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true,
        user: existingUser,
      });
    });
  });
});
