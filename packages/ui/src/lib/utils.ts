import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Token type roles (globals.css `--text-*`). Without this tailwind-merge reads `text-label` as a
// colour and drops it when a colour class such as `text-text-default` follows (or vice versa).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'page-title',
        'section-title',
        'body',
        'body-dense',
        'label',
        'meta',
        'code',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
