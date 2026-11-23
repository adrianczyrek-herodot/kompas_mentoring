/** Worker cron: drops idempotency keys past their 24 h retention (spec §4.6). */
export const PURGE_IDEMPOTENCY_QUEUE = 'platform.purge-idempotency-keys';
export const PURGE_IDEMPOTENCY_CRON = '41 * * * *';
