const API_BASE = "https://video.bunnycdn.com/library";

interface BunnyConfig {
  libraryId: string;
  apiKey: string;
  hostname: string;
}

export interface BunnyVideoDetails {
  guid: string;
  title: string;
  status: number; // 0 queued | 1 processing | 2 encoding | 3 finished | 4 resolution finished | 5 failed
  encodeProgress: number;
  length: number; // seconds
  width?: number;
  height?: number;
  availableResolutions?: string;
  thumbnailCount: number;
  thumbnailFileName?: string;
  videoLibraryId?: number;
}

function config(): BunnyConfig {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const hostname = process.env.BUNNY_STREAM_HOSTNAME;
  if (!libraryId || !apiKey || !hostname) {
    throw new Error(
      "Bunny Stream is not configured. Set BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY and BUNNY_STREAM_HOSTNAME."
    );
  }
  return { libraryId, apiKey, hostname };
}

function baseHeaders(apiKey: string): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    AccessKey: apiKey,
  };
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return `${res.status} ${res.statusText}: ${text.slice(0, 200)}`;
}

/** Creates a video "slot" in the library. Returns the Bunny video GUID. */
export async function createBunnyVideo(
  title: string,
  thumbnailTime?: number
): Promise<BunnyVideoDetails> {
  const { libraryId, apiKey } = config();
  const res = await fetch(`${API_BASE}/${libraryId}/videos`, {
    method: "POST",
    headers: baseHeaders(apiKey),
    body: JSON.stringify({
      title: title || "Untitled Video",
      thumbnailTime: thumbnailTime ?? null,
    }),
  });
  if (!res.ok) throw new Error(`Bunny create video failed: ${await parseError(res)}`);
  return (await res.json()) as BunnyVideoDetails;
}

/**
 * Returns a signed upload URL. The browser PUTs the raw file bytes straight
 * to this URL, so the API key never leaves the server.
 */
export async function getBunnyUploadUrl(videoId: string): Promise<{ videoId: string; uploadUrl: string }> {
  const { libraryId, apiKey } = config();
  const res = await fetch(`${API_BASE}/${libraryId}/videos/${videoId}`, {
    method: "POST",
    headers: baseHeaders(apiKey),
    body: "{}",
  });
  if (!res.ok) throw new Error(`Bunny upload url failed: ${await parseError(res)}`);
  return (await res.json()) as { videoId: string; uploadUrl: string };
}

export async function getBunnyVideo(videoId: string): Promise<BunnyVideoDetails> {
  const { libraryId, apiKey } = config();
  const res = await fetch(`${API_BASE}/${libraryId}/videos/${videoId}`, {
    method: "GET",
    headers: baseHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Bunny get video failed: ${await parseError(res)}`);
  return (await res.json()) as BunnyVideoDetails;
}

export async function patchBunnyVideo(videoId: string, patch: Record<string, unknown>): Promise<boolean> {
  const { libraryId, apiKey } = config();
  const res = await fetch(`${API_BASE}/${libraryId}/videos/${videoId}`, {
    method: "PATCH",
    headers: baseHeaders(apiKey),
    body: JSON.stringify(patch),
  });
  return res.ok;
}

export async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  const { libraryId, apiKey } = config();
  const res = await fetch(`${API_BASE}/${libraryId}/videos/${videoId}`, {
    method: "DELETE",
    headers: baseHeaders(apiKey),
  });
  return res.ok;
}

/** HLS playback manifest used by hls.js / native players. */
export function bunnyHlsUrl(videoId: string): string {
  return `https://${config().hostname}/${videoId}/playlist.m3u8`;
}

/** Default auto-generated thumbnail (set after encoding, safe once status >= 4). */
export function bunnyThumbnailUrl(videoId: string, t?: number): string {
  const base = `https://${config().hostname}/${videoId}/thumbnail.jpg`;
  return typeof t === "number" ? `${base}?t=${t}` : base;
}

/** Bunny's hosted player (iframe). Useful as a fallback / share link. */
export function bunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${config().libraryId}/${videoId}`;
}

/** MP4 progressive file. */
export function bunnyMp4Url(videoId: string): string {
  return `https://${config().hostname}/${videoId}/play.mp4`;
}

export function isBunnyFinished(status: number): boolean {
  return status === 3 || status === 4;
}

export function isBunnyFailed(status: number): boolean {
  return status === 5;
}