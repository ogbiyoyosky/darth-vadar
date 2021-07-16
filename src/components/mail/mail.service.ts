import * as path from 'path';
import * as fs from 'fs';
import env from '../../helpers/env';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { SendOption } from './mail.interface';
import {
    CourseCompletionMailInput,
    EmailConfirmationInput, PasswordResetMailInput, ResendEmailConfirmationInput,
} from './templates/interfaces/template.interface';
import logger from '../../logger';


export class MailService {
    from: string = '"Dartvadar" <snettpro@gmail.com>';
    transportOption: SMTPTransport.Options;
    mail: Mail;

    constructor() {
      this.transportOption = {
        host: process.env.MAIL_HOST,
        port: env.get('MAIL_PORT') ? parseInt(env.get('MAIL_PORT')) : 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
      };

      this.mail = nodemailer.createTransport(this.transportOption);
    }

    /**
     * Compose and return the HTML format of a mail
     * @param { object } data - An object containing dynamic information to be used
     * in the composition of an email
     * @param { string } templateName - The name of a template file in the `mailTemplates` directory
     */
    composeTemplate(templateName: string, data: object): string {
        const templatePath = path.join(__dirname, '../../../../src/components/mail/templates', `/${templateName}.hbs`);
        console.log({templatePath})
        const templateFile = fs.readFileSync(templatePath).toString();
        const template = handlebars.compile(templateFile);
        return template(data);
    }

    /**
     * Sends an email
     * @param { object } options - The email options
     * @param { string[] } options.recipients - An array of the email recipients
     * @param { string } options.subject - The subject of the mail
     * @param { string } options.text - A plaintext format of the mail
     * @param { string | Buffer } options.html - A html format of the mail
     */
    async send(options: SendOption) {
        logger.info("sending email >>>>",options.recipients)
        logger.info(JSON.stringify(options.recipients))
      try {
          this.mail.sendMail({
              from: options.from || this.from,
              to: options.recipients,
              subject: options.subject,
              text: options.text,
              html: options.template,
              attachments: options.attachments
          });
      } catch (error) {
          logger.error("mail sending err",JSON.stringify(error))
          console.error(error);
          throw error;
      }
    }

    /**
     * Sends email confirmation mail to a user
     * @param { EmailConfirmationInput } options - An object containing mail information
     */
    async sendEmailConfirmation(options: EmailConfirmationInput): Promise<void> {
        const template = this.composeTemplate('email-confirmation', options.data);
        await this.send({
            recipients: options.recipients,
            subject: 'Email Confirmation',
            template,
        });
    }
    
    /**
     * Resends email confirmation mail to a user
     * @param { ResendEmailConfirmationInput } options - An object containing the referrer's details
     */
    async resendEmailConfirmation(options: ResendEmailConfirmationInput): Promise<void> {
        const template = this.composeTemplate('email-confirmation-resend', options.data);
        await this.send({
            recipients: options.recipients,
            subject: 'Email Confirmation',
            template,
        });
    }

    /**
     * Sends password reset link to a user
     * @param { PasswordResetMailInput } options - The mail options
     */
    async sendPasswordResetLink(options: PasswordResetMailInput) {
        const template = this.composeTemplate('password-reset', options.data);
        await this.send({
            recipients: options.recipients,
            subject: 'Reset Your Password',
            template
        });
    }

}
