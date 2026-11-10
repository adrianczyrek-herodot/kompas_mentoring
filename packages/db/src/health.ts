import type { MikroORM } from "@mikro-orm/postgresql";

export type DbHealth = { ok: true } | { ok: false; reason: string };

export class DbHealthCheck {
  private readonly orm: MikroORM;

  constructor({ orm }: { orm: MikroORM }) {
    this.orm = orm;
  }

  /** Sprawdza połączenie z bazą; `reason` służy do logów, nie pokazuj go użytkownikowi. */
  async check(): Promise<DbHealth> {
    try {
      // Zapytanie, a nie `checkConnection()`: MikroORM łączy się leniwie, przy pierwszym zapytaniu.
      await this.orm.em.getConnection().execute("select 1");
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message || error.name : String(error) };
    }
  }
}
