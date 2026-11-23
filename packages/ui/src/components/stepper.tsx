import { Check, CircleAlert } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../lib/utils';

/** State of one step of the onboarding (spec F2, M1). */
type StepperStepState = 'completed' | 'current' | 'upcoming' | 'error';

interface StepperStep {
  /** Stable id of the step (the API key of the step). */
  readonly id: string;
  /** Short name of the step, e.g. "O mnie". */
  readonly label: string;
  readonly state: StepperStepState;
  /** Link to the step; without it the step is not a link (the current one usually is not). */
  readonly href?: string;
}

interface StepperProps extends Omit<React.ComponentProps<'ol'>, 'children'> {
  readonly steps: readonly StepperStep[];
  /** Name of the navigation, e.g. "Kroki onboardingu". */
  readonly label: string;
}

/**
 * Progress of the onboarding (M1): the six steps of the profile. A list, not a graphic — the
 * current step carries `aria-current="step"`, so a screen reader announces where the mentor is.
 * A step with an error keeps its place in the list and is marked with an icon, not colour alone.
 */
function Stepper({ steps, label, className, ...props }: StepperProps) {
  return (
    <nav aria-label={label}>
      <ol
        data-slot="stepper"
        className={cn('flex flex-col gap-tight', className)}
        {...props}
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            data-slot="stepper-item"
            data-state={step.state}
            className="flex items-center gap-inline"
          >
            <span
              data-slot="stepper-marker"
              aria-hidden="true"
              className={cn(
                'flex size-control-sm shrink-0 items-center justify-center rounded-round border text-meta font-medium',
                step.state === 'completed' && 'border-action-primary bg-action-primary text-text-on-action',
                step.state === 'current' && 'border-border-control bg-surface-panel text-text-default',
                step.state === 'upcoming' && 'border-border-divider bg-surface-page text-text-muted',
                step.state === 'error' && 'border-border-invalid bg-status-danger-bg text-status-danger-fg',
              )}
            >
              {step.state === 'completed' ? (
                <Check className="size-icon-sm" />
              ) : step.state === 'error' ? (
                <CircleAlert className="size-icon-sm" />
              ) : (
                (index + 1).toString()
              )}
            </span>
            {step.href === undefined ? (
              <span
                data-slot="stepper-label"
                aria-current={step.state === 'current' ? 'step' : undefined}
                className={cn(
                  'text-body-dense',
                  step.state === 'current' && 'font-medium text-text-default',
                  step.state === 'upcoming' && 'text-text-muted',
                  step.state === 'error' && 'text-status-danger-fg',
                )}
              >
                {step.label}
              </span>
            ) : (
              <a
                data-slot="stepper-link"
                href={step.href}
                aria-current={step.state === 'current' ? 'step' : undefined}
                className={cn(
                  'rounded-tag text-body-dense underline-offset-4 hover:underline',
                  step.state === 'upcoming' && 'text-text-muted',
                  step.state === 'completed' && 'text-text-default',
                  step.state === 'error' && 'text-status-danger-fg',
                )}
              >
                {step.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { Stepper, type StepperProps, type StepperStep, type StepperStepState };
