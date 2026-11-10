import {
  createContainer as createAwilixContainer,
  InjectionMode,
  type AwilixContainer,
} from "awilix";

/**
 * Rejestr zależności aplikacji. Pakiety rozszerzają go przez
 * `declare module "@devmentor/core" { interface Cradle { ... } }`,
 * dzięki czemu `container.resolve("...")` i wstrzykiwanie są typowane.
 */
export interface Cradle {}

export type AppContainer = AwilixContainer<Cradle>;

/**
 * Tworzy kontener Awilix z ustawieniami obowiązującymi w całym projekcie:
 * tryb PROXY (zależności wstrzykiwane jako jeden obiekt `({ a, b })`)
 * i tryb strict (wykrywa m.in. singleton zależny od zależności scoped).
 */
export function createContainer(): AppContainer {
  return createAwilixContainer<Cradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });
}

export { asClass, asFunction, asValue, Lifetime } from "awilix";
