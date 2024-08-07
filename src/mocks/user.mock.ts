/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { IUserDocument } from "../features/user/interfaces/user.interface";

export const mockExistingUser = {
  _id: "60263f14648fed5246e322d3",
  name: "John Simons",
  email: "john@me.com",
  role: "customer",
  createdAt: "2022-08-31T07:42:24.451Z",
} as unknown as IUserDocument;

export const existingUser = {
  _id: "60263f14648fed5246e322d3",
  uId: "1621613119252065",
  name: "John Simons",
  email: "john@me.com",
  role: "customer",
  createdAt: new Date(),
} as unknown as IUserDocument;

export const existingUserTwo = {
  _id: "60263f14648fed5246e322d9",
  uId: "1621613119252066",
  email: "manny@me.com",
  role: "customer",
  createdAt: new Date(),
} as unknown as IUserDocument;

export const searchedUserMock = {
  _id: "60263f14648fed5246e322d5",
  uId: "1621613119252062",
  name: "Kenny Mane",
  email: "ken@me.com",
  role: "customer",
} as unknown as IUserDocument;

export const userJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
