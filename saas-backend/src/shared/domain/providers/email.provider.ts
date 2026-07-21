export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
