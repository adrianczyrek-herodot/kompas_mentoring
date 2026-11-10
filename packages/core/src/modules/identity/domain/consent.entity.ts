import type { Temporal } from 'temporal-polyfill';
import type { UserId } from '../../../shared/domain/index.ts';

/** Documents a user can consent to; `terms` and `privacy` are required at registration (P4). */
export type ConsentDocument = 'terms' | 'privacy' | 'marketing';

/**
 * One consent decision: which document version, given or withdrawn, and when (Q6). Decisions are
 * append-only; the latest decision per document is the current state (S3 marketing toggle).
 */
export interface Consent {
  readonly userId: UserId;
  readonly document: ConsentDocument;
  readonly version: string;
  readonly granted: boolean;
  readonly decidedAt: Temporal.Instant;
}
