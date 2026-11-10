import { existsSync } from "node:fs";
import type { NextConfig } from "next";

// Jeden plik `.env` w korzeniu monorepo (zmienne już ustawione w środowisku mają pierwszeństwo).
const rootEnv = new URL("../../.env", import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  // Pakiety wewnętrzne są dostarczane jako źródła TypeScript — Next.js je transpiluje.
  transpilePackages: ["@devmentor/core", "@devmentor/db", "@devmentor/ui"],
  // MikroORM i sterownik PostgreSQL ładowane przez Node.js, nie bundlowane.
  serverExternalPackages: ["@mikro-orm/core", "@mikro-orm/postgresql", "@mikro-orm/sql", "pg"],
};

export default nextConfig;
