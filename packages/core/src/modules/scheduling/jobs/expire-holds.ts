/** pg-boss job that releases holds past their 10-minute deadline (spec §4.4, rule 5). */
export const EXPIRE_HOLDS_QUEUE = 'scheduling.expire-holds';
export const EXPIRE_HOLDS_CRON = '* * * * *';
