import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const base32Decode = (input: string): Buffer => {
  let bits = '';
  for (const char of input.replace(/=+$/, '').toUpperCase()) {
    bits += BASE32.indexOf(char).toString(2).padStart(5, '0');
  }
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map((byte) => Number.parseInt(byte, 2)));
};

/** RFC 6238 code (SHA-1, 6 digits, 30 s) — what an authenticator app shows for the secret. */
export const totp = (secret: string, at = Date.now()): string => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const digest = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = (digest.at(-1) ?? 0) & 0x0f;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, '0');
};

/** Q4: admins exist only through the CLI — the same command the team runs. */
export const createAdminViaCli = (email: string, password: string) => {
  execFileSync('pnpm', ['--filter', '@kompas/core', 'run', 'admin:create', '--email', email], {
    env: { ...process.env, ADMIN_PASSWORD: password },
    stdio: 'pipe',
  });
};
