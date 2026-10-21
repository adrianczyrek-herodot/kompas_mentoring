import { type AwilixContainer, asFunction } from 'awilix';
import type { Clock } from '../../shared/domain/index.ts';
import {
  type GetCancellationTerms,
  makeGetCancellationTerms,
} from './application/get-cancellation-terms.query.ts';

export interface SchedulingCradle {
  getCancellationTerms: GetCancellationTerms;
}

/** Registers the scheduling module; application services are scoped per request / per job. */
export const registerSchedulingModule = (
  container: AwilixContainer<SchedulingCradle & { clock: Clock }>,
): void => {
  container.register({
    getCancellationTerms: asFunction(makeGetCancellationTerms).scoped(),
  });
};
