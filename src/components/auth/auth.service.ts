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
import { AuthJWTInput, ChangePasswordInput, CreateUserAccountInput, LoginInput, ResetPasswordInput } from './auth.input';
import { LoggedInType } from './auth.type';
import { UserShape } from '../user/user.model';


export class AuthService {
  frontendBaseUrl: string = env.getFrontendBaseUrl();
  JWT_AUTH_SECRET: string = env.get('JWT_AUTH_SECRET');
  private BCRYPT_SALT: number = parseInt(env.get('BCRYPT_SALT'));

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Stores JWT in a cookie named `token`
   * @param { Response } response - An instance of the Express response object
   * @param { string } token - A JWT
   */
  storeTokenInCookie(response: Response, token: string): void {
    response.cookie('token', token, {
      maxAge: 7776000000, // 90 days in milliseconds
      httpOnly: true
    });
  }

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
      { expiresIn: '90d' }
    );
  }

  /**
   * Composes email confirmation link
   * @param { string } token - A verification token
   */
  private composeConfirmationLink(token: string): string {
    return `${this.frontendBaseUrl}/verification?token=${token}`;
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
  private composeLoginData(user: UserShape, token: string): LoggedInType {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token,
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
        role: 'student',
      });

      await this.mailService.sendEmailConfirmation({
        recipients: [user.email],
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          confirmationLink: this.composeConfirmationLink(user.activationToken),
        }
      });

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
    } catch (error) {
     throw error; 
    }
  }

  /**
   * Verify user's email
   */
  async verifyEmail(verificationToken: string): Promise<LoggedInType> {
    const user: UserShape = await this.userService.verifyEmail(verificationToken);

    const jwt = this.generateJWT(user);

    return this.composeLoginData(user, jwt);
  }
  
  /**
   * Resends verification email for unverified accounts
   */
  async resendVerificationMail(email: string): Promise<void> {
    const verificationToken = await this.userService.regenerateActivationToken(email);

    await this.mailService.resendEmailConfirmation({
      recipients: [email],
      data: {
        confirmationLink: this.composeConfirmationLink(verificationToken)
      }
    });
  }

  /**
   * Logs a user in
   */
  async login(data: LoginInput): Promise<LoggedInType> {
    const genericMessage = 'Invalid email or password';
    const user = await this.userService.findByEmail(data.email);


    if (!user) {
      throw new UnauthorizedError(genericMessage);
    }

    if (user.isDeleted || user.deactivatedAt) {
      throw new UnauthorizedError('Account not found');
    }

    if (!user.password) {
      throw new UnauthorizedError(genericMessage);
    }
    
    const match = await bcrypt.compare(data.password, user.password);

    if (!match) {
      throw new UnauthorizedError(genericMessage);
    }

    const jwt = this.generateJWT(user);
    
    return this.composeLoginData(user, jwt);
  }
  
  /**
   * Changes the password of a user
   */
  async changePassword(data: ChangePasswordInput): Promise<void> {
    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    const user = await this.userService.findById(data.userId);

    if (!user) {
      throw new NotFoundError('Account not found');
    }

    const match = await bcrypt.compare(data.currentPassword, user.password);

    if (!match) {
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
      throw new NotFoundError('We could not find your account');
    }

    const resetToken = randomstring.generate();

    await this.tokenService.createPasswordResetToken({ value: resetToken, ownerId: user.id });

    await this.mailService.sendPasswordResetLink({
      recipients: [email],
      data: {
        resetLink: this.composePasswordResetLink(resetToken)
      }
    });
  }

  /**
   * Resets a user's password
   */
   async resetPassword(input: ResetPasswordInput): Promise<void> {
    if (input.password !== input.confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    const token = await this.tokenService.findByValue(input.resetToken);

    if (!token) {
      throw new BadRequestError('Invalid token');
    }

    if (this.tokenService.checkIfExpired(token)) {
      throw new BadRequestError('Expired reset link. Please request a new reset link');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.BCRYPT_SALT);

    await this.userService.update(token.ownerId, { password: hashedPassword });
  }

  /**
   * Logouts a user's client out of the application by deleting their refresh token if one exists
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) throw new Error('Provide a refresh token');
      // const { id }: any = await verifyRefreshToken(refreshToken);

    await this.tokenService.delete(refreshToken);
  }
}