import { EmailProvider, SendEmailInput } from "./EmailProvider";

/** Logs emails to the console instead of sending them. Used until SMTP credentials are configured. */
export class MockEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[MockEmailProvider] To: ${input.to} | Subject: ${input.subject}\n${input.text ?? input.html}`);
  }
}
