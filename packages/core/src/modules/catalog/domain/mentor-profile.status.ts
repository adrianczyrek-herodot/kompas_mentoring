// The lifecycle of the mentor profile: the states and the events that move it between them.
// The types live in their own file, because the errors of the module refer to them and the
// state machine refers to the errors — a cycle would break the dependency rules (spec §2.4).

export type MentorProfileStatus =
  | 'draft'
  | 'submitted'
  | 'changes_requested'
  | 'approved'
  | 'suspended'
  | 'rejected';

export type MentorProfileEvent =
  | 'submitted'
  | 'withdrawn'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'suspended'
  | 'reinstated';
