import { healthContract } from './health.contract.ts';

export { HealthStatus, healthContract } from './health.contract.ts';

/** Root oRPC contract: one zod schema → validation, typed client and OpenAPI (spec §1.1). */
export const contract = {
  health: healthContract,
};

export type Contract = typeof contract;
