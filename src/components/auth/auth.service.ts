import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as randomstring from 'randomstring';
import env from '../../helpers/env';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../errors';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { MailService } from '../mail/mail.service';
import { UserType } from '../user/user.type';
import { ChangePasswordInput, CreateUserAccountInput, LoginInput, ResetPasswordInput } from './auth.input';
import { LoggedInType } from './auth.type';
import { UserShape } from '../user/user.model';
import { redisClient } from '../../redis.connection';
import logger from '../../logger';


export class AuthService {
  frontendBaseUrl: string = env.getBackendUrl();
  JWT_AUTH_SECRET: string = env.get('JWT_AUTH_SECRET');
  REFRESH_TOKEN_SECRET: string = env.get('REFRESH_TOKEN_SECRET');
  private BCRYPT_SALT: number = parseInt(env.get('BCRYPT_SALT'));

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}



  /**
   * Generates JWT for a user
   * @param data - An object containing the ID and email of a user 
   * @returns { string } - JWT
   */
  private generateJWT(user: UserShape): string {
    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role, 
      date: Date.now(),
    };
    return jwt.sign(
      payload,
      this.JWT_AUTH_SECRET,
      { expiresIn: '1d' }
    );
  }

  /**
   * generate new refresh token
   */
   async generateNewRefreshToken(refreshToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET, (err, payload) => {
    
        logger.info("invalid refresh token")
        if (err) return reject(new UnauthorizedError("invalid refresh token"));
  
        redisClient.GET(`refreshToken:${payload.id}:${refreshToken}`, async (err, result) => {
          logger.info("Internal Server Error")
          if (err) {
            reject(Error("Internal Server Error"));
          }

          if (refreshToken === result) {
            var newRefreshToken = await this.generateRefreshToken(payload)
        
            var token = this.generateJWT(payload)
            return resolve({refreshToken: newRefreshToken, token});
          } else {
            logger.info("Invalid Refresh token")
            reject(new UnauthorizedError("Invalid Refresh token"));
          }
        });
      });
    });
  }

  /**
   * Generates JWT for a user
   * @param data - An object containing the ID and email of a user 
   * @returns { string } - JWT
   */
   private generateRefreshToken(user: UserShape): Promise<string> {
    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role, 
      date: Date.now(),
    };
   

    return new Promise((resolve, reject)=> {
      jwt.sign(
        payload,
        this.REFRESH_TOKEN_SECRET,
        { expiresIn: '90d' },
        (err, token)=> {
          redisClient.SET(
            `refreshToken:${payload.id}:${token}`,
            token,
            "EX",
            365 * 24 * 60 * 60,
            (err, reply) => {
              logger.info("Internal Server Error")
              if (err) {
                reject(new Error("Internal Server Error"));
             
              }
              resolve(token);
            }
          );
        }
      )
    })
    
  }

  /**
   * Composes email confirmation link
   * @param { string } token - A verification token
   */
  private composeConfirmationLink(token: string): string {
    return `${this.frontendBaseUrl}/api/auth/verification?token=${token}`;
  }
  
  /**
   * Composes password reset link
   * @param { string } token - A verification token
   */
  private composePasswordResetLink(token: string): string {
    return `${this.frontendBaseUrl}/password-reset?token=${token}`;
  }

  /**
   * Composes the login data
   */
  private composeLoginData(user: UserShape, token: string, refreshToken: string): LoggedInType {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token,
      refreshToken
    }
  }

  /**
   * Creates a new user account
   */
  async register(data: CreateUserAccountInput): Promise<UserType> {
    try {
      const user = await this.userService.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'user',
      });

      if(process.env.NODE_ENV != 'test') {
        await this.mailService.sendEmailConfirmation({
          recipients: [user.email],
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            confirmationLink: this.composeConfirmationLink(user.activationToken),
          }
        });
      }

      

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
    } catch (error) {
      logger.info(JSON.stringify(error))
     throw error; 
    }
  }

  /**
   * Verify user's email
   */
  async verifyEmail(verificationToken: string): Promise<LoggedInType> {
    const user: UserShape = await this.userService.verifyEmail(verificationToken);

    const jwt = this.generateJWT(user);
    const refreshToken = await this.generateRefreshToken(user)

    return this.composeLoginData(user, jwt, refreshToken );
  }

  private async validateRefreshToken() {

  }



  
  
  /**
   * Resends verification email for unverified accounts
   */
  async resendVerificationMail(email: string): Promise<void> {
    const verificationToken = await this.userService.regenerateActivationToken(email);

    if(process.env.NODE_ENV != 'test') {
      await this.mailService.resendEmailConfirmation({
        recipients: [email],
        data: {
          confirmationLink: this.composeConfirmationLink(verificationToken)
        }
      });
    }
  }

  /**
   * Logs a user in
   */
  async login(data: LoginInput): Promise<LoggedInType> {
    const genericMessage = 'Invalid email or password';
    const user = await this.userService.findByEmail(data.email);


    
    if (!user) {
      logger.info(genericMessage)
      throw new UnauthorizedError(genericMessage);
    }

    
    if (user.isDeleted || user.deactivatedAt) {
      logger.info("Account not found")
      throw new UnauthorizedError('Account not found');
    }

    
    if (!user.password) {
      logger.info(genericMessage)
      throw new UnauthorizedError(genericMessage);
    }
    
    const match = await bcrypt.compare(data.password, user.password);

    
    if (!match) {
      logger.info(genericMessage)
      throw new UnauthorizedError(genericMessage);
    }

    const jwt = this.generateJWT(user);
    const refreshToken = await this.generateRefreshToken(user)
    
    return this.composeLoginData(user, jwt, refreshToken);
  }
  
  /**
   * Changes the password of a user
   */
  async changePassword(data: ChangePasswordInput): Promise<void> {
    
    if (data.newPassword !== data.confirmPassword) {
      logger.info("Passwords do not match")
      throw new BadRequestError('Passwords do not match');
    }

    const user = await this.userService.findById(data.userId);

    
    if (!user) {
      logger.info("Account not found")
      throw new NotFoundError('Account not found');
    }

    const match = await bcrypt.compare(data.currentPassword, user.password);

    
    if (!match) {
      logger.info("Current password is incorrect")
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, this.BCRYPT_SALT);

    await this.userService.update(user.id, { password: hashedPassword });
  }

  /**
   * Initiates a password reset
   */
   async initiatePasswordReset(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    
    if (!user || user.deactivatedAt) {
      logger.info("We could not find your account")
      throw new NotFoundError('We could not find your account');
    }

    const resetToken = randomstring.generate();

    await this.tokenService.createPasswordResetToken({ value: resetToken, ownerId: user.id });
    if(process.env.NODE_ENV != 'test') {
      await this.mailService.sendPasswordResetLink({
        recipients: [email],
        data: {
          resetLink: this.composePasswordResetLink(resetToken),
          token: resetToken
        }
      });
    }
  }

  /**
   * Resets a user's password
   */
   async resetPassword(input: ResetPasswordInput): Promise<void> {
    
    if (input.password !== input.confirmPassword) {
      logger.info('Passwords do not')
      throw new BadRequestError('Passwords do not match');
    }

    const token = await this.tokenService.findByValue(input.resetToken);

    
    if (!token) {
      logger.info("Invalid token")
      throw new BadRequestError('Invalid token');
    }

    
    if (this.tokenService.checkIfExpired(token)) {
      logger.info('Expired reset link. Please request a new reset link')
      throw new BadRequestError('Expired reset link. Please request a new reset link');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.BCRYPT_SALT);

    await this.userService.update(token.ownerId, { password: hashedPassword });
  }

  /**g
   * Logouts a user's client out of the application by deleting their refresh token if one exists
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      logger.info("Provide a refresh token")
      throw new Error('Provide a refresh token');
    }
      // const { id }: any = await verifyRefreshToken(refreshToken);

      return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET, (err, payload) => {
         
          
          if (err) {
            logger.info("Invalid refresh token") 
            return reject(new UnauthorizedError("Invalid refresh token"));
          }
 
          redisClient.DEL(`refreshToken:${payload.id}:${refreshToken}`, async (err, result) => {
            
            if (err) {
              logger.info("Invalid refresh token")
              reject(Error("Invalid refresh token"));
            }
             resolve()
          });
        });
      });
  }
}