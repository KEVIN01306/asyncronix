import { Resend } from 'resend';
import type { EmailProvider, SendEmailOptions } from '../../domain/providers/email.provider.js';
import AppError from '../../errors/AppError.js';

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not defined in environment variables. Email sending will fail.');
    }
    this.resend = new Resend(apiKey || 'missing-key');
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || 'Asyncronix <no-reply@asyncronix.com>';
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error('Error sending email via Resend:', error);
        throw new AppError(`Fallo al enviar el correo: ${error.message}`, 'EMAIL_SEND_FAILED', 500);
      }

      console.log(`Email sent successfully to ${options.to}. ID: ${data?.id}`);
    } catch (error) {
      console.error('Unexpected error sending email:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error interno al enviar el correo', 'EMAIL_PROVIDER_ERROR', 500);
    }
  }
}
