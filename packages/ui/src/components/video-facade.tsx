'use client';

import { Play } from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import type { VideoProvider } from './video-link-field';

interface VideoFacadeProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  readonly provider: VideoProvider;
  readonly videoId: string;
  /** Title of the film — the name of the iframe and the button. */
  readonly title: string;
  /** URL of the thumbnail shown before the click (the app may build one from the provider). */
  readonly thumbnailUrl?: string | null;
}

/**
 * Facade of the video (requirement 3): before the click there is only a thumbnail and a button —
 * no cookies of YouTube or Vimeo, no third-party request. The player appears after the click.
 * `youtube-nocookie.com` and `dnt=1` keep the embedding as private as the providers allow.
 */
function VideoFacade({
  provider,
  videoId,
  title,
  thumbnailUrl = null,
  className,
  ...props
}: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const source =
    provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}?dnt=1`;

  return (
    <div
      data-slot="video-facade"
      data-state={playing ? 'playing' : 'idle'}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-panel border border-border-divider bg-surface-sunken',
        className,
      )}
      {...props}
    >
      {playing ? (
        <iframe
          data-slot="video-facade-player"
          src={source}
          title={title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          data-slot="video-facade-play"
          onClick={() => {
            setPlaying(true);
          }}
          className="absolute inset-0 flex size-full items-center justify-center gap-inline bg-surface-panel text-text-default hover:bg-surface-hover"
        >
          {thumbnailUrl !== null && (
            // eslint-disable-next-line @next/next/no-img-element -- the thumbnail comes from the provider's CDN as is
            <img src={thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          <span className="relative flex items-center gap-inline rounded-control bg-surface-panel px-inline py-tight text-label font-medium">
            <Play aria-hidden="true" className="size-icon-sm" />
            {title}
          </span>
        </button>
      )}
    </div>
  );
}

export { VideoFacade, type VideoFacadeProps };
