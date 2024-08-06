import Joi, { ObjectSchema } from "joi";

const signupSchema: ObjectSchema = Joi.object().keys({
  name: Joi.string().required().min(4).max(200).messages({
    "string.base": "Name must be of type string",
    "string.min": "Invalid name",
    "string.max": "Invalid  name",
    "string.empty": "Name is a required field",
  }),
  password: Joi.string().required().min(4).max(8).messages({
    "string.base": "Password must be of type string",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.empty": "Password is a required field",
  }),
  email: Joi.string().required().email().messages({
    "string.base": "Email must be of type string",
    "string.email": "Email must be valid",
    "string.empty": "Email is a required field",
  }),
  // avatarColor: Joi.string()
  //   .required()
  //   .messages({ "any.required": "Avatar color is required" }),
  // avatarImage: Joi.string().required().messages({
  //   "any.required": "Avatar image is required",
  // }),
});

export { signupSchema };
