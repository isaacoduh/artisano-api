import Joi, { ObjectSchema } from "joi";

const createSellerSchema: ObjectSchema = Joi.object().keys({
  shopName: Joi.string().required().min(4).max(200).messages({
    "string.base": "Shop name must be of type string",
    "string.min": "Invalid shop name",
    "string.max": "Invalid shop name",
    "string.empty": "Shop name is a required field",
  }),
  contactInfo: Joi.string().required().min(10).max(14).messages({
    "string.base": "contact info should be of type string",
    "string.min": "Invalid contact information",
    "string.max": "Invalid contact information",
    "string.empty": "Contact information is a required field",
  }),
});

export { createSellerSchema };
