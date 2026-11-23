import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CATEGORY_SLUGS, PROFILE_STEPS } from './limits.ts';
import { SaveProfileStepInput } from './profile-steps.ts';

export const MentorProfileStatus = z.enum([
  'draft',
  'submitted',
  'changes_requested',
  'approved',
  'suspended',
  'rejected',
]);

/** The mentor's own profile as M1 shows it (`GET /me/mentor-profile`). Money in grosze (spec §5). */
export const MentorProfileView = z.object({
  id: z.uuid(),
  slug: z.string(),
  status: MentorProfileStatus,
  /** False while the application is under review or closed (Q6). */
  editable: z.boolean(),
  displayName: z.string(),
  photoUrl: z.string().nullable(),
  country: z.string().nullable(),
  languages: z.array(z.string()),
  categories: z.array(z.enum(CATEGORY_SLUGS)),
  tags: z.array(z.string()),
  yearsExperience: z.number().int().nullable(),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      fromYear: z.number().int().nullable(),
      toYear: z.number().int().nullable(),
    }),
  ),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  video: z.object({ provider: z.enum(['youtube', 'vimeo']), videoId: z.string() }).nullable(),
  videoUrl: z.string().nullable(),
  rate60Amount: z.number().int().nullable(),
  rate30Amount: z.number().int().nullable(),
  currency: z.literal('PLN'),
  completedSteps: z.array(z.enum(PROFILE_STEPS)),
  nextStep: z.enum(PROFILE_STEPS).nullable(),
  requestedFields: z.array(z.string()),
  version: z.number().int(),
});
export type MentorProfileView = z.infer<typeof MentorProfileView>;

/** Problem detail data for 422 responses: one entry per invalid field (RFC 9457 extension). */
export const FieldIssues = z.object({
  issues: z.array(z.object({ field: z.string(), problem: z.string() })),
});

/** GET /api/me/mentor-profile — opens (lazily creates) the signed-in mentor's draft profile. */
export const getMyMentorProfileContract = oc
  .route({ method: 'GET', path: '/me/mentor-profile', summary: 'Own mentor profile (M1)' })
  .output(MentorProfileView);

/** PUT /api/me/mentor-profile/steps/{step} — saves one M1 step as a draft (409 on a stale version). */
export const saveProfileStepContract = oc
  .route({
    method: 'PUT',
    path: '/me/mentor-profile/steps/{step}',
    summary: 'Save an M1 step draft',
  })
  .input(SaveProfileStepInput)
  .output(MentorProfileView);
