/**
 * Media detection and URL parsing utilities for Events & Announcements.
 * Supports YouTube, Vimeo, HTML5 direct video URLs (MP4, WebM, OGG),
 * and base64 video data URLs.
 */

/**
 * Parses video URL to determine provider and generated embed URL
 * @param {string} url 
 * @returns {{ type: 'youtube' | 'vimeo' | 'html5' | 'unknown', embedUrl: string, originalUrl: string } | null}
 */
export function parseVideoUrl(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();
  if (!clean) return null;

  // 1. YouTube
  // Matches: youtube.com/watch?v=XYZ, youtu.be/XYZ, youtube.com/embed/XYZ, youtube.com/shorts/XYZ
  const ytMatch = clean.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      backgroundEmbedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: clean,
    };
  }

  // 2. Vimeo
  // Matches: vimeo.com/123456789, player.vimeo.com/video/123456789
  const vimeoMatch = clean.match(
    /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?([0-9]+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`,
      backgroundEmbedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1&loop=1&autopause=0`,
      thumbnailUrl: "",
      originalUrl: clean,
    };
  }

  // 3. Base64 Video Data URL
  if (/^data:video\/(mp4|webm|ogg);base64,/i.test(clean)) {
    return {
      type: "html5",
      embedUrl: clean,
      originalUrl: clean,
    };
  }

  // 4. Direct video URL (.mp4, .webm, .ogg, etc.) or general http/https video URL
  if (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(clean) ||
    clean.startsWith("http://") ||
    clean.startsWith("https://")
  ) {
    return {
      type: "html5",
      embedUrl: clean,
      originalUrl: clean,
    };
  }

  return {
    type: "unknown",
    embedUrl: clean,
    originalUrl: clean,
  };
}

/**
 * Returns complete media summary for an event or announcement record
 * @param {Object} item 
 * @returns {{ hasMedia: boolean, mediaType: 'image' | 'video' | 'none', imageUrl: string, videoUrl: string, videoInfo: Object | null }}
 */
export function getMediaSummary(item) {
  if (!item) {
    return {
      hasMedia: false,
      mediaType: "none",
      imageUrl: "",
      videoUrl: "",
      videoInfo: null,
    };
  }

  const imageUrl = item.imageUrl ? item.imageUrl.trim() : "";
  const videoUrl = item.videoUrl ? item.videoUrl.trim() : "";
  const rawType = item.mediaType;

  // Determine actual active type
  let mediaType = "none";
  if (rawType === "video" && videoUrl) {
    mediaType = "video";
  } else if (rawType === "image" && imageUrl) {
    mediaType = "image";
  } else if (videoUrl) {
    mediaType = "video";
  } else if (imageUrl) {
    mediaType = "image";
  }

  const videoInfo = mediaType === "video" ? parseVideoUrl(videoUrl) : null;
  const hasMedia = mediaType !== "none";

  return {
    hasMedia,
    mediaType,
    imageUrl,
    videoUrl,
    videoInfo,
  };
}
