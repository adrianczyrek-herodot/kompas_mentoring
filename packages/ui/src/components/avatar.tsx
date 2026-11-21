'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

// Photo of a person, round (rounded-round, P-T5); initials on surface-sunken while the photo loads
// or when there is none. Sizes P-T15.
const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-round bg-surface-sunken align-middle font-medium text-text-default select-none',
  {
    variants: {
      size: {
        sm: 'size-avatar-sm text-meta',
        md: 'size-avatar-md text-label',
        lg: 'size-avatar-lg text-section-title',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type AvatarProps = AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>;

function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

/** `alt=""` when the name is written next to the avatar; otherwise the person's name. */
function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('size-full object-cover', className)}
      {...props}
    />
  );
}

/** Initials (1–2 letters). Hidden from screen readers when the name is next to the avatar. */
function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('flex size-full items-center justify-center', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage, type AvatarProps };
