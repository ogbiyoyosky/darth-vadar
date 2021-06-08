import { Attachment } from "nodemailer/lib/mailer";

export interface BaseTemplateInput {
  /** An array of email addresses */
  recipients: string[];
  data: any;
  attachment?: Attachment[]
}

export interface EmailConfirmationInput extends BaseTemplateInput {
  recipients: string[];
  data: {
    firstName: string,
    lastName: string,
    confirmationLink: string
  };
}

export interface ResendEmailConfirmationInput extends BaseTemplateInput {
  data: {
    confirmationLink: string,
  };
}

export interface PasswordResetMailInput extends BaseTemplateInput {
  data: {
    resetLink: string,
    token: string
  };
}

export interface CourseCompletionMailInput extends BaseTemplateInput {
  data: {
    userFirstName: string,
    userLastName: string,
    courseName: string,
  };
}