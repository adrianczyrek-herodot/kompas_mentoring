import type { Logger } from '../../../../shared/infrastructure/logger.ts';
import type { EmailVerificationSender } from '../../application/email-verification-sender.port.ts';

/** Development adapter: writes the link to the log instead of sending it (replaced by SES in F3). */
export class LoggingEmailVerificationSender implements EmailVerificationSender {
  readonly #logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.#logger = logger;
  }

  sendVerificationLink({ url }: { to: string; url: string }): Promise<void> {
    // The recipient address is personal data and stays out of the log (spec §6.5).
    this.#logger.info(
      { url },
      'identity: e-mail verification link (not sent, development adapter)',
    );
    return Promise.resolve();
  }
}
