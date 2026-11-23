import type * as React from 'react';
import { cn } from '../lib/utils';

type VideoProvider = 'youtube' | 'vimeo';

/**
 * Recognises the two providers the profile accepts (spec F2, "Wideo"): YouTube (watch, short and
 * youtu.be) and Vimeo. The application stores `{ provider, videoId }`, never the raw URL (A05).
 */
export const parseVideoLink = (
  url: string,
): { provider: VideoProvider; videoId: string } | null => {
  const value = url.trim();
  if (value.length === 0) return null;
  let parsed: URL;
  try {
    parsed = new URL(value.includes('://') ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '');
  if (host === 'youtu.be') {
    const id = parsed.pathname.split('/').find((part) => part.length > 0) ?? '';
    return /^[\w-]{11}$/.test(id) ? { provider: 'youtube', videoId: id } : null;
  }
  if (host === 'youtube.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v') ?? '';
      return /^[\w-]{11}$/.test(id) ? { provider: 'youtube', videoId: id } : null;
    }
    if (parsed.pathname.startsWith('/shorts/')) {
      const segments = parsed.pathname.split('/').filter((part) => part.length > 0);
  const id = segments.at(1) ?? '';
      return /^[\w-]{11}$/.test(id) ? { provider: 'youtube', videoId: id } : null;
    }
    return null;
  }
  if (host === 'vimeo.com') {
    const id = parsed.pathname.split('/').find((part) => part.length > 0) ?? '';
    return /^\d{6,12}$/.test(id) ? { provider: 'vimeo', videoId: id } : null;
  }
  return null;
};

interface VideoLinkFieldProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** Message under the field (the link is not from YouTube or Vimeo). */
  readonly error?: string | null;
  /** Name of the link, read out when the field gets the focus. */
  readonly description?: string;
}

/**
 * Field of the video link (M1 step 3): the mentor pastes a YouTube or Vimeo address. The component
 * recognises the provider and says so under the field; the server checks the same rules again.
 */
function VideoLinkField({
  value,
  onChange,
  error = null,
  description,
  className,
  id,
  ...props
}: VideoLinkFieldProps) {
  const link = parseVideoLink(value);
  return (
    <div data-slot="video-link-field" className={cn('flex flex-col gap-tight', className)}>
      <input
        id={id}
        data-slot="video-link-input"
        type="url"
        inputMode="url"
        value={value}
        placeholder="https://youtu.be/…"
        aria-invalid={error !== null ? true : undefined}
        aria-describedby={description === undefined ? undefined : `${id ?? 'video'}-description`}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="h-control w-full min-w-0 rounded-control border border-border-control bg-surface-panel px-field-x text-body text-text-default transition-colors duration-fast placeholder:text-text-subtle aria-invalid:border-border-invalid"
        {...props}
      />
      {error === null && link !== null && (
        <p data-slot="video-link-hint" className="text-body-dense text-text-muted">
          {link.provider === 'youtube' ? 'YouTube' : 'Vimeo'} · film {link.videoId}
        </p>
      )}
      {description !== undefined && (
        <p id={`${id ?? 'video'}-description`} className="text-body-dense text-text-muted">
          {description}
        </p>
      )}
      {error !== null && (
        <p role="alert" data-slot="video-link-error" className="text-body-dense text-status-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export { VideoLinkField, type VideoLinkFieldProps, type VideoProvider };
