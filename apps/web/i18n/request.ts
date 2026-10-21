import { getRequestConfig } from 'next-intl/server';
import messages from '../messages/pl.json';

// MVP is Polish only, but every UI text lives in messages/pl.json from day one (spec §1.2).
export default getRequestConfig(() =>
  Promise.resolve({ locale: 'pl', timeZone: 'Europe/Warsaw', messages }),
);
