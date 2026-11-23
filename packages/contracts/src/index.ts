import {
  confirmPhotoUploadContract,
  getMyMentorProfileContract,
  requestPhotoUploadContract,
  saveProfileStepContract,
} from './catalog/index.ts';
import { healthContract } from './health.contract.ts';
import {
  addAvailabilityExceptionContract,
  deleteAvailabilityExceptionContract,
  getMentorCalendarContract,
  saveAvailabilityTemplateContract,
  updateMentorSettingsContract,
} from './scheduling/index.ts';

export { HealthStatus, healthContract } from './health.contract.ts';

/** Root oRPC contract: one zod schema → validation, typed client and OpenAPI (spec §1.1). */
export const contract = {
  health: healthContract,
  myMentorProfile: getMyMentorProfileContract,
  saveProfileStep: saveProfileStepContract,
  requestPhotoUpload: requestPhotoUploadContract,
  confirmPhotoUpload: confirmPhotoUploadContract,
  getMentorCalendar: getMentorCalendarContract,
  saveAvailabilityTemplate: saveAvailabilityTemplateContract,
  addAvailabilityException: addAvailabilityExceptionContract,
  deleteAvailabilityException: deleteAvailabilityExceptionContract,
  updateMentorSettings: updateMentorSettingsContract,
};

export type Contract = typeof contract;
