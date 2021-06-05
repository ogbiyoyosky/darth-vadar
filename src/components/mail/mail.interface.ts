import Mail, { Attachment } from "nodemailer/lib/mailer";
import { Readable } from "nodemailer/lib/xoauth2";

export interface SendOption {
  recipients: string[];
  subject: string;
  from?: string;
  text?: string;
  template?: string | Buffer | Readable | Mail.AttachmentLike;
  attachments?: Mail.AttachmentLike[] | Attachment[]
}