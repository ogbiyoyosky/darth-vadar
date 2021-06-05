import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import env from '../../helpers/env';
import { UnauthorizedError } from '../../errors';
import { User } from '../../components/user/user.model'

export interface AuthGuardOptions {
  /**
   * If false, this tells the guard to allow the request to go through without throwing
   * an error even if authentication is failed. Defaults to `true`.
   */
  strict?: boolean;
}

/**
 * Creates a handler for authenticating request
 * @param options - Guard options
 * @returns an express request handler
 */
export default function AuthGuard(options?: AuthGuardOptions): RequestHandler {
  const strict: boolean = options?.strict !== undefined ? options?.strict : true;
  
  const JWT_AUTH_SECRET: string = env.get('JWT_AUTH_SECRET');

  return async (req: Request, res: Response, next: NextFunction) => {

    //const { token } = req.cookies;
    const { authorization } = req.headers;
    const token = authorization?.split(' ')[1];
    console.log(token)

    try {
      if (!token) {
        throw new Error();
      }
      
      const decodedUserInfo = jwt.verify(token, JWT_AUTH_SECRET);

      const userInfoFromDB = await User.query().findById(decodedUserInfo.id);

      if (!userInfoFromDB || userInfoFromDB.isDeleted || userInfoFromDB.deactivatedAt) throw new Error();

      req['user'] = decodedUserInfo;

      next();
    } catch (error) {
      if (strict) {
        next(new UnauthorizedError('Please sign in or create an account'));
      }

      next();
    }
  }
}