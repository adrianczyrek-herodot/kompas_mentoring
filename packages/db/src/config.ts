import { defineConfig, type Options } from "@mikro-orm/postgresql";
import { entities } from "./entities";

/**
 * Wspólna konfiguracja MikroORM dla aplikacji i CLI.
 * Encje są przekazane wprost (bez skanowania folderów), więc działa też po zbundlowaniu przez Next.js.
 */
export function createOrmConfig(overrides: Partial<Options> = {}): Options {
  return defineConfig({
    clientUrl: process.env.DATABASE_URL,
    entities,
    pool: {
      min: 0,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    },
    debug: process.env.NODE_ENV === "development" ? ["query"] : false,
    ...overrides,
  });
}
