import { asClass, asFunction, asValue, type AppContainer } from "@devmentor/core";
import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { DbHealthCheck } from "./health";

declare module "@devmentor/core" {
  interface Cradle {
    orm: MikroORM;
    /** EntityManager z własną mapą tożsamości — rozwiązuj w scope żądania (`container.createScope()`). */
    em: EntityManager;
    dbHealthCheck: DbHealthCheck;
  }
}

/** Rejestruje zależności warstwy danych. Wywoływane wyłącznie z composition rootu w `@devmentor/app`. */
export function registerDb(container: AppContainer, orm: MikroORM): void {
  container.register({
    orm: asValue(orm),
    em: asFunction(({ orm }: { orm: MikroORM }) => orm.em.fork()).scoped(),
    dbHealthCheck: asClass(DbHealthCheck).singleton(),
  });
}
