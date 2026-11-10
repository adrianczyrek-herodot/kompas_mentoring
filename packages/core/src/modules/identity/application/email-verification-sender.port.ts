/**
 * Port: delivers the e-mail verification link (Q2). F1 ships a logging adapter for development
 * and a fake for tests; the SES adapter arrives with notifications in F3.
 */
export interface EmailVerificationSender {
  sendVerificationLink(message: { to: string; url: string }): Promise<void>;
}
