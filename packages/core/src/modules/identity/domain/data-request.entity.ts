import type { Temporal } from 'temporal-polyfill';
import type { UserId } from '../../../shared/domain/index.ts';

/** S3 (Q7): export of personal data or account deletion — recorded now, carried out in F8. */
export type DataRequestKind = 'export' | 'deletion';

export interface DataRequest {
  readonly id: string;
  readonly userId: UserId;
  readonly kind: DataRequestKind;
  readonly requestedAt: Temporal.Instant;
}
