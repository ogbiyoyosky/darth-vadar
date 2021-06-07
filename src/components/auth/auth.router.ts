import { Router } from "express";
import { IAuthController } from "./auth.controller";
import { ComponentRouterOptions } from '../../shared/types/ComponentRouterOptions';
import { AuthValidator } from "./auth.dto";

export function AuthRouter(options: ComponentRouterOptions<IAuthController, AuthValidator>): Router {
    const { controller, guards, validator } = options;

    const router = Router();

    /**
     * @register - register a user
     */
    router.post(
        "/register",
        validator.CreateAccountDto.validate,
        controller.register
    );

    /**
     * @verifyEmail - Verifies a user's email address
     */
    router.get('/verification', controller.verifyEmail);

    /**
     * @resendVerificationMail - Resends verification mail
     */
    router.post('/verification/resend', controller.resendVerificationMail);


    /**
     * @requestPasswordReset - Requests a password reset on behalf of a user
     */
     router.post('/forgot-password',validator.RequestPassqordResetDto.validate, controller.requestPasswordReset);

    /**
     * @resetPassword - Requests a password reset on behalf of a user
     */
     router.post('/reset-password',validator.ResetPasswordDto.validate, controller.resetPassword);

    /**
     * @login - sign in a user
     */
    router.post(
        "/login",
        validator.LoginDto.validate,
        controller.login
    );

    /**
     * @logout
     */
    router.post("/logout", validator.RefreshTokenDto.validate, controller.logout);

    /**
     * @generateRefreshTohen
     */
     router.post("/refresh-token", validator.RefreshTokenDto.validate, controller.generateToken);


    return router;
}
