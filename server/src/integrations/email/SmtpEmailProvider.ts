import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";
import { EmailProvider, SendEmailInput } from "./EmailProvider";

export class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.email.smtpHost,
      port: env.email.smtpPort,
      secure: env.email.smtpPort === 465,
      auth: env.email.smtpUser ? { user: env.email.smtpUser, pass: env.email.smtpPassword } : undefined,
    });
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: env.email.smtpFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
