import type { MentorProfileView, SaveProfileStepInput } from '@kompas/contracts/catalog';
import { money } from '../../../shared/domain/index.ts';
import type { CatalogError } from '../domain/catalog.errors.ts';
import {
  firstIncompleteStep,
  type MentorProfile,
  type StepInput,
} from '../domain/mentor-profile.entity.ts';
import { isEditable } from '../domain/mentor-profile.state.ts';
import { halfHourRate } from '../domain/policies/rate.policy.ts';
import { videoPageUrl } from '../domain/policies/video-link.policy.ts';

const amount = (value: bigint): number => money.toMinorUnits(money.of(value));

/** Aggregate → the JSON view M1 and `GET /me/mentor-profile` show (money in grosze, spec §5). */
export const toMentorProfileView = (
  profile: MentorProfile,
  context: { displayName: string; photoUrl: string | null },
): MentorProfileView => ({
  id: profile.id,
  slug: profile.slug,
  status: profile.status,
  editable: isEditable(profile.status),
  displayName: context.displayName,
  photoUrl: context.photoUrl,
  country: profile.country,
  languages: [...profile.languages],
  categories: profile.categories as MentorProfileView['categories'],
  tags: [...profile.tags],
  yearsExperience: profile.yearsExperience,
  experience: profile.experience.map((entry) => ({ ...entry })),
  headline: profile.headline,
  bio: profile.bio,
  video: profile.video,
  videoUrl: profile.video ? videoPageUrl(profile.video) : null,
  rate60Amount: profile.rate60 ? amount(profile.rate60.amount) : null,
  rate30Amount: profile.rate60 ? amount(halfHourRate(profile.rate60).amount) : null,
  currency: 'PLN',
  completedSteps: [...profile.completedSteps],
  nextStep: firstIncompleteStep(profile),
  requestedFields: [...profile.requestedFields],
  version: profile.version,
});

/** Validated step body (contract) → domain step input; the domain re-checks every rule. */
export const toStepInput = (input: SaveProfileStepInput): StepInput => {
  switch (input.step) {
    case 'about':
      return { step: 'about', fields: input.fields };
    case 'skills':
      return { step: 'skills', fields: input.fields };
    case 'bio':
      return { step: 'bio', fields: input.fields };
    case 'rate': {
      const { rate60Amount } = input.fields;
      return {
        step: 'rate',
        fields: { rate60: rate60Amount === null ? null : money.of(BigInt(rate60Amount)) },
      };
    }
  }
};

export interface CatalogProblem {
  readonly status: 403 | 404 | 409 | 422;
  readonly code: CatalogError['code'];
  readonly issues?: readonly { field: string; problem: string }[];
}

/** Expected failures → RFC 9457 status codes (spec §4.9). */
export const toCatalogProblem = (error: CatalogError): CatalogProblem => {
  switch (error.code) {
    case 'catalog.forbidden':
      return { status: 403, code: error.code };
    case 'catalog.not_found':
      return { status: 404, code: error.code };
    case 'catalog.profile_locked':
    case 'catalog.version_conflict':
    case 'catalog.invalid_transition':
      return { status: 409, code: error.code };
    case 'catalog.invalid_fields':
      return { status: 422, code: error.code, issues: error.issues };
    case 'catalog.photo_invalid':
      return { status: 422, code: error.code, issues: [{ field: 'photo', problem: error.reason }] };
    case 'catalog.incomplete_profile':
      return {
        status: 422,
        code: error.code,
        issues: error.missingSteps.map((step) => ({ field: step, problem: 'required' })),
      };
  }
};
