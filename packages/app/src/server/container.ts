import "server-only";
import { asClass, createContainer, SystemClock, type AppContainer } from "@devmentor/core";
import { getOrm, registerDb } from "@devmentor/db";

const globalForContainer = globalThis as unknown as { devmentorContainer?: Promise<AppContainer> };

async function buildContainer(): Promise<AppContainer> {
  const container = createContainer();
  container.register({ clock: asClass(SystemClock).singleton() });
  registerDb(container, await getOrm());
  return container;
}

/**
 * Composition root aplikacji — jedyne miejsce, w którym składany jest kontener Awilix.
 * W handlerach i Server Components używaj `getRequestScope()`, żeby zależności scoped (np. `em`) były per żądanie.
 */
export function getContainer(): Promise<AppContainer> {
  globalForContainer.devmentorContainer ??= buildContainer().catch((error: unknown) => {
    globalForContainer.devmentorContainer = undefined;
    throw error;
  });
  return globalForContainer.devmentorContainer;
}

export async function getRequestScope(): Promise<AppContainer> {
  return (await getContainer()).createScope();
}
