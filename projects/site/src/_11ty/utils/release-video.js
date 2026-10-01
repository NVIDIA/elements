import { existsSync } from 'node:fs';
import { normalizeContentDate } from './content-dates.js';
import { getSiteUrl } from './site-url.js';

const RELEASES_DIR = new URL('../../../public/static/video/releases/', import.meta.url);

export function getReleaseVideo(data = {}) {
  if (!data.tags?.includes('whats-new') || !data.updateMonth) return null;

  const month = new Date(data.updateMonth);
  if (Number.isNaN(month.getTime())) throw new Error(`Invalid What’s New updateMonth: ${data.updateMonth}`);

  const slug = `${String(month.getUTCMonth() + 1).padStart(2, '0')}-${month.getUTCFullYear()}`;
  if (!existsSync(new URL(`${slug}.webm`, RELEASES_DIR))) return null;

  const missing = [
    !existsSync(new URL(`${slug}.webp`, RELEASES_DIR)) && `${slug}.webp poster`,
    !data.videoSummary?.trim() && 'videoSummary',
    !data.videoPublishedAt && 'videoPublishedAt',
    !data.videoDuration && 'videoDuration'
  ].filter(Boolean);
  if (missing.length) throw new Error(`What’s New video ${slug} is missing ${missing.join(', ')}`);

  const uploadDate = normalizeContentDate(data.videoPublishedAt);
  if (!uploadDate) throw new Error(`What’s New video ${slug} has an invalid videoPublishedAt`);
  if (!/^PT\d+(?:\.\d+)?S$/.test(data.videoDuration)) {
    throw new Error(`What’s New video ${slug} needs videoDuration in ISO 8601 seconds`);
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC', year: 'numeric' }).format(
    month
  );
  const videoPath = `/static/video/releases/${slug}.webm`;
  const posterPath = `/static/video/releases/${slug}.webp`;

  return {
    slug,
    title: `${monthLabel} NVIDIA Elements release highlights`,
    description: data.videoSummary.trim(),
    posterAlt: `Title card for the ${monthLabel} NVIDIA Elements release highlights video.`,
    videoPath,
    posterPath,
    videoUrl: getSiteUrl(videoPath),
    posterUrl: getSiteUrl(posterPath),
    uploadDate,
    duration: data.videoDuration
  };
}
