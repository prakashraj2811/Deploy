import { env } from "../../config/env";
import { EmailProvider } from "./EmailProvider";
import { MockEmailProvider } from "./MockEmailProvider";
import { SmtpEmailProvider } from "./SmtpEmailProvider";

export const emailProvider: EmailProvider =
  env.email.provider === "smtp" ? new SmtpEmailProvider() : new MockEmailProvider();

export * from "./EmailProvider";
