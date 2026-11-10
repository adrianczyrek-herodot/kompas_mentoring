// `ADMIN_PASSWORD=… pnpm admin:create --email a@kompas.pl --name "Ala" --role admin_trust`
// Q4 (F1): the only way to get an admin account. The password comes from the environment, not
// from the command line, so it stays out of shell history; 2FA is set up on first sign-in.
import { parseArgs } from 'node:util';
import { createAppContainer } from '../../../../container.ts';
import { directDatabaseUrl, parseEnv } from '../../env.ts';
import { createLogger } from '../../logger.ts';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string', default: 'Administrator' },
    role: { type: 'string', default: 'admin_trust' },
  },
});
const password = process.env['ADMIN_PASSWORD'];
const role = values.role;
if (values.email === undefined || password === undefined) {
  throw new Error('Usage: ADMIN_PASSWORD=… pnpm admin:create --email <e-mail> [--name] [--role]');
}
if (role !== 'admin_trust' && role !== 'admin_finance') {
  throw new Error('--role must be admin_trust or admin_finance');
}

const env = parseEnv();
const logger = createLogger({ level: env.LOG_LEVEL, module: 'identity' });
// Direct connection, like the other database CLIs (spec §1.4).
const container = createAppContainer({
  env: { ...env, DATABASE_URL: directDatabaseUrl(env) },
  logger,
});
try {
  const outcome = await container.cradle.createAdminAccount({
    email: values.email,
    name: values.name,
    password,
    role,
  });
  logger.info({ role, outcome }, 'identity: admin account ready');
} finally {
  await container.cradle.orm.close();
}
