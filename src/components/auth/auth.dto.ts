import createValidator, { IValidator } from '../../helpers/createValidator';

export class AuthValidator {
    CreateAccountDto = createValidator((Joi) => {
        return {
            firstName: Joi.string()
              .required()
              .trim()
              .error(new Error("firstName is required")),
            lastName: Joi.string()
              .required()
              .trim()
              .error(new Error("lastName is required")),
            email: Joi.string()
              .email()
              .required()
              .trim()
              .lowercase()
              .error(new Error("A valid email address is required")),
            password: Joi.string()
              .required()
              .error(new Error("Password is required")),
          }
    });

    LoginDto = createValidator((Joi) => {
        return {
            email: Joi.string()
              .required()
              .trim()
              .lowercase()
              .error(new Error("A valid email address is required")),
            password: Joi.string()
              .required()
              .error(new Error("Password is required"))
              .min(6)
              .error(new Error("Password must be a minimum of six characters")),
        }
    });

    ChangePasswordDto = createValidator((Joi) => {
        return {
            password: Joi.string()
              .required()
              .trim()
              .error(new Error("Please enter a valid password")),
        }
    });

    RequestPassqordResetDto = createValidator((Joi) => {
        return {
            email: Joi.string()
              .required()
              .trim()
              .lowercase()
              .error(new Error("A valid email address is required")),
        }
    });

    ResetPasswordDto = createValidator((Joi) => {
        return {
            password: Joi.string()
              .required()
              .trim()
              .error(new Error("Please enter a valid password")),
        }
    });
}
