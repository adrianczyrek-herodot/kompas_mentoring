import * as contracts from '@kompas/contracts/catalog';
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_SLUGS,
  COUNTRIES,
  LANGUAGES,
  LIMITS,
  PHOTO,
  PROFILE_STEPS,
} from '../domain/policies/config.ts';
import { toCatalogProblem, toStepInput } from './mentor-profile.api.ts';

describe('contracts mirror the catalog field rules', () => {
  it('uses the same limits (money in grosze as numbers)', () => {
    const { rate60, ...rest } = LIMITS;
    const { rate60: contractRate, ...contractRest } = contracts.CATALOG_LIMITS;
    expect(contractRest).toEqual(rest);
    expect(contractRate).toEqual({
      min: Number(rate60.min),
      max: Number(rate60.max),
      step: Number(rate60.step),
    });
  });

  it('offers the same closed lists and steps', () => {
    expect(contracts.CATEGORY_SLUGS).toEqual(CATEGORY_SLUGS);
    expect(contracts.COUNTRIES).toEqual(COUNTRIES);
    expect(contracts.LANGUAGES).toEqual(LANGUAGES);
    expect(contracts.PROFILE_STEPS).toEqual(PROFILE_STEPS);
    expect(contracts.PHOTO_RULES).toEqual({
      contentTypes: PHOTO.contentTypes,
      maxBytes: PHOTO.maxBytes,
      minSide: PHOTO.minSide,
    });
  });
});

describe('catalog API mapping', () => {
  it('turns the rate in grosze into Money', () => {
    expect(
      toStepInput({ step: 'rate', expectedVersion: 1, fields: { rate60Amount: 15_000 } }),
    ).toEqual({
      step: 'rate',
      fields: { rate60: { amount: 15_000n, currency: 'PLN' } },
    });
    expect(
      toStepInput({ step: 'rate', expectedVersion: 1, fields: { rate60Amount: null } }),
    ).toEqual({
      step: 'rate',
      fields: { rate60: null },
    });
  });

  it('maps expected failures to RFC 9457 statuses', () => {
    expect(toCatalogProblem({ code: 'catalog.forbidden' }).status).toBe(403);
    expect(toCatalogProblem({ code: 'catalog.not_found' }).status).toBe(404);
    expect(toCatalogProblem({ code: 'catalog.version_conflict' }).status).toBe(409);
    expect(toCatalogProblem({ code: 'catalog.profile_locked', status: 'submitted' }).status).toBe(
      409,
    );
    expect(
      toCatalogProblem({ code: 'catalog.invalid_transition', from: 'draft', event: 'approved' })
        .status,
    ).toBe(409);
    expect(
      toCatalogProblem({
        code: 'catalog.invalid_fields',
        issues: [{ field: 'bio', problem: 'too_short' }],
      }),
    ).toEqual({
      status: 422,
      code: 'catalog.invalid_fields',
      issues: [{ field: 'bio', problem: 'too_short' }],
    });
    expect(
      toCatalogProblem({ code: 'catalog.photo_invalid', reason: 'dimensions' }).issues,
    ).toEqual([{ field: 'photo', problem: 'dimensions' }]);
    expect(
      toCatalogProblem({ code: 'catalog.incomplete_profile', missingSteps: ['bio'] }).issues,
    ).toEqual([{ field: 'bio', problem: 'required' }]);
  });
});
