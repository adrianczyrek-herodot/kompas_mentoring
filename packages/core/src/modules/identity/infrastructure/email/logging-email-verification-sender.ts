import type { Env } from '../../../../shared/infrastructure/env.ts';
import type { Logger } from '../../../../shared/infrastructure/logger.ts';
import type { EmailVerificationSender } from '../../application/email-verification-sender.port.ts';

/** Development adapter: writes the link to the log instead of sending it (replaced by SES in F3). */
export class LoggingEmailVerificationSender implements EmailVerificationSender {
  readonly #logger: Logger;
  readonly #revealLink: boolean;

  constructor({ logger, env }: { logger: Logger; env: Env }) {
    this.#logger = logger;
    // The link carries a verification token: only local environments may print it.
    this.#revealLink = env.NODE_ENV !== 'production';
  }

  sendVerificationLink({ url }: { to: string; url: string }): Promise<void> {
    // The recipient address is personal data and stays out of the log (spec §6.5).
    if (this.#revealLink) {
      this.#logger.info(
        { url },
        'identity: e-mail verification link (not sent, development adapter)',
      );
    } else {
      this.#logger.warn('identity: e-mail verification not sent (no e-mail adapter until F3)');
    }
    return Promise.resolve();
  }
}
