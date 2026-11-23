import {
  confirmPhotoUploadContract,
  getMyMentorProfileContract,
  requestPhotoUploadContract,
  saveProfileStepContract,
  setAcceptingNewContract,
} from './catalog/index.ts';
import { healthContract } from './health.contract.ts';
import {
  addAvailabilityExceptionContract,
  checkoutContract,
  createHoldContract,
  deleteAvailabilityExceptionContract,
  deleteHoldContract,
  getBookingContract,
  getHoldContract,
  getMentorAvailabilityContract,
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
  setAcceptingNew: setAcceptingNewContract,
  getMentorAvailability: getMentorAvailabilityContract,
  getMentorCalendar: getMentorCalendarContract,
  saveAvailabilityTemplate: saveAvailabilityTemplateContract,
  addAvailabilityException: addAvailabilityExceptionContract,
  deleteAvailabilityException: deleteAvailabilityExceptionContract,
  updateMentorSettings: updateMentorSettingsContract,
  createHold: createHoldContract,
  getHold: getHoldContract,
  deleteHold: deleteHoldContract,
  checkout: checkoutContract,
  getBooking: getBookingContract,
};

export type Contract = typeof contract;
