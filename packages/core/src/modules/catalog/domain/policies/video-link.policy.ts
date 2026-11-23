export type VideoProvider = 'youtube' | 'vimeo';

/** Stored instead of the raw URL (A05): the embed URL is built on our side from these two values. */
export interface VideoLink {
  readonly provider: VideoProvider;
  readonly videoId: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com']);

const toUrl = (raw: string): URL | null => {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
};

const youtubeId = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be') return url.pathname.split('/')[1] ?? null;
  if (!YOUTUBE_HOSTS.has(host)) return null;
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const shorts = /^\/shorts\/([^/]+)\/?$/.exec(url.pathname);
  return shorts?.[1] ?? null;
};

const vimeoId = (url: URL): string | null => {
  if (!VIMEO_HOSTS.has(url.hostname.toLowerCase())) return null;
  return /^\/(\d+)\/?$/.exec(url.pathname)?.[1] ?? null;
};

/**
 * Video is optional (Q4): a YouTube link (`youtube.com/watch`, `youtu.be`, `/shorts/`) or a Vimeo
 * link (`vimeo.com/<id>`). Anything else → `null` (the caller reports the field as invalid).
 */
export const parseVideoLink = (raw: string): VideoLink | null => {
  const url = toUrl(raw);
  if (url === null || !['http:', 'https:'].includes(url.protocol)) return null;
  const youtube = youtubeId(url);
  if (youtube !== null)
    return YOUTUBE_ID.test(youtube) ? { provider: 'youtube', videoId: youtube } : null;
  const vimeo = vimeoId(url);
  return vimeo !== null && VIMEO_ID.test(vimeo) ? { provider: 'vimeo', videoId: vimeo } : null;
};

/** Canonical link shown back in the M1 form. */
export const videoPageUrl = (video: VideoLink): string =>
  video.provider === 'youtube'
    ? `https://www.youtube.com/watch?v=${video.videoId}`
    : `https://vimeo.com/${video.videoId}`;
