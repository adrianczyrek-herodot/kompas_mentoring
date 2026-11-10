// Konfiguracja dla CLI MikroORM (migracje). Aplikacja używa `getOrm()` z `src/orm.ts`.
import { existsSync } from "node:fs";
import { Migrator } from "@mikro-orm/migrations";
import { createOrmConfig } from "./src/config";

const rootEnv = new URL("../../.env", import.meta.url);

// Jeden plik `.env` w korzeniu monorepo (zmienne już ustawione w środowisku mają pierwszeństwo).
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export default createOrmConfig({
  extensions: [Migrator],
  migrations: {
    path: "./src/migrations",
    glob: "!(*.d).{js,ts}",
  },
});
