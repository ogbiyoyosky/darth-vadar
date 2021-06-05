import { User } from './user.model';
import { UserService } from './user.service';
// import { UserValidator } from './user.dto';
// import { UserControllerFactory } from './user.controller';
// import { UserRouter } from './user.router';
// import guards from '../../shared/guards';

export const userService = new UserService(User);

// export const userController = UserControllerFactory(userService);

// export const userRouter = UserRouter({
//   guards,
//   controller: userController,
//   validator: new UserValidator(),
// });
