/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Response } from "express";
import { AuthPayload } from "../features/auth/interfaces/auth.interface";
import { IUserDocument } from "../features/user/interfaces/user.interface";

export const authMockRequest = (
  sessionData: IJWT,
  body: any,
  currentUser?: AuthPayload | null,
  params?: any
) => ({
  session: sessionData,
  body,
  params,
  currentUser,
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IAuthMock {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const authUserPayload: AuthPayload = {
  userId: "60263f14648fed5246e322d9",
  email: "john@me.com",
  role: "customer",
  iat: 1234,
};

export const authMock = {
  _id: "60263f14648fed5246e322d3",
  name: "John Simons",
  email: "john@me.com",
  role: "customer",
  createdAt: "2022-08-31T07:42:24.451Z",
  comparePassword: () => false,
} as unknown as IUserDocument;
