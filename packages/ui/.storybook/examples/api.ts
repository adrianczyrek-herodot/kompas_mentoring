/**
 * Simulated API answers for pattern and screen stories (Storybook only). Components never call
 * the API; patterns get async callbacks and stories pass one of these scenarios (ADR-0006, spec
 * „API w stories: bez MSW”).
 */
export type ApiScenario = 'success' | 'pending' | 'field-error' | 'server-error' | 'offline';

export type ApiResult =
  | { ok: true }
  | { ok: false; kind: 'field'; field: string; message: string }
  | { ok: false; kind: 'server' }
  | { ok: false; kind: 'offline' };

export const apiScenarios: ApiScenario[] = [
  'success',
  'pending',
  'field-error',
  'server-error',
  'offline',
];

/** Resolves after `delay` ms with the scenario's answer; `pending` never resolves. */
export function fakeRequest(
  scenario: ApiScenario,
  fieldError: { field: string; message: string } = { field: '', message: '' },
  delay = 300,
): Promise<ApiResult> {
  if (scenario === 'pending') return new Promise(() => undefined);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (scenario === 'success') resolve({ ok: true });
      else if (scenario === 'field-error') resolve({ ok: false, kind: 'field', ...fieldError });
      else if (scenario === 'server-error') resolve({ ok: false, kind: 'server' });
      else resolve({ ok: false, kind: 'offline' });
    }, delay);
  });
}
