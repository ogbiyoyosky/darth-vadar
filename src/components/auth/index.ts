import Guards from '../../shared/guards';
import { mailService } from '../mail';
import { tokenService } from '../token';
import { userService } from "../user/"
import { AuthControllerFactory } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthValidator } from './auth.dto';
import { AuthRouter } from './auth.router';

export const authService = new AuthService(
  userService,
  tokenService,
  mailService
);

export const authController = AuthControllerFactory(authService);

export const authRouter = AuthRouter({
  controller: authController,
  guards: Guards,
  validator: new AuthValidator(),
});
