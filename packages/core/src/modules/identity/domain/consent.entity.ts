import type { Temporal } from 'temporal-polyfill';
import type { UserId } from '../../../shared/domain/index.ts';

/** Documents a user can consent to; `terms` and `privacy` are required at registration (P4). */
export type ConsentDocument = 'terms' | 'privacy' | 'marketing';

/** One recorded consent: which document version and when (Q6: versions recorded from F1). */
export interface Consent {
  readonly userId: UserId;
  readonly document: ConsentDocument;
  readonly version: string;
  readonly givenAt: Temporal.Instant;
}
