import { GOAL } from './config.ts';

export type GoalProblem = 'too_short' | 'too_long';

/** U2: the goal of a trial is 20–500 characters (spec „goalPolicy”). */
export const goalProblem = (goal: string): GoalProblem | null => {
  if (goal.length < GOAL.minLength) return 'too_short';
  if (goal.length > GOAL.maxLength) return 'too_long';
  return null;
};
