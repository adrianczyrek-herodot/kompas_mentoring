import { MikroORM } from "@mikro-orm/postgresql";
import { createOrmConfig } from "./config";

const globalForOrm = globalThis as unknown as { devmentorOrm?: Promise<MikroORM> };

/**
 * Jedna instancja ORM (i jedna pula połączeń) na proces.
 * Trzymana na `globalThis`, żeby hot reload w `next dev` nie otwierał nowych pul.
 */
export function getOrm(): Promise<MikroORM> {
  globalForOrm.devmentorOrm ??= MikroORM.init(createOrmConfig()).catch((error: unknown) => {
    globalForOrm.devmentorOrm = undefined;
    throw error;
  });
  return globalForOrm.devmentorOrm;
}
