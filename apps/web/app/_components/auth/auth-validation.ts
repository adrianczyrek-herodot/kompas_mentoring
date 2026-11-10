// Client-side checks for instant feedback; the server (Better Auth + identity hooks) decides.

export interface Credentials {
  name: string;
  email: string;
  password: string;
  as: 'student' | 'mentor';
  terms: boolean;
  marketing: boolean;
}

/** Keys of `Auth.errors` in messages/pl.json. */
type FieldErrorKey = 'required' | 'email' | 'nameLength' | 'passwordLength' | 'terms';

export type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'terms', FieldErrorKey>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const raw = (data: FormData, name: string): string => {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
};

const text = (data: FormData, name: string): string => raw(data, name).trim();

export const readCredentials = (data: FormData): Credentials => ({
  name: text(data, 'name'),
  email: text(data, 'email'),
  password: raw(data, 'password'),
  as: data.get('as') === 'mentor' ? 'mentor' : 'student',
  terms: data.get('terms') !== null,
  marketing: data.get('marketing') !== null,
});

const length = (value: string) => Array.from(value).length;

export const validateCredentials = (
  mode: 'login' | 'register',
  credentials: Credentials,
): FieldErrors => {
  const errors: FieldErrors = {};
  if (mode === 'register') {
    if (credentials.name === '') errors.name = 'required';
    else if (length(credentials.name) < 2 || length(credentials.name) > 50)
      errors.name = 'nameLength';
  }
  if (credentials.email === '') errors.email = 'required';
  else if (!EMAIL.test(credentials.email)) errors.email = 'email';
  if (credentials.password === '') errors.password = 'required';
  else if (
    mode === 'register' &&
    (length(credentials.password) < 10 || length(credentials.password) > 128)
  )
    errors.password = 'passwordLength';
  if (mode === 'register' && !credentials.terms) errors.terms = 'terms';
  return errors;
};
