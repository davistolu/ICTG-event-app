import React, { useState } from "react";
import { Play, Video, Image as ImageIcon, AlertCircle } from "lucide-react";
import { parseVideoUrl } from "../utils/mediaHelpers";

export default function MediaDisplay({
  mediaType = "none",
  imageUrl = "",
  videoUrl = "",
  title = "Media",
  mode = "hero", // "hero" | "card" | "thumbnail" | "preview"
  className = "",
  showPlayBadge = true,
}) {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlayingInline, setIsPlayingInline] = useState(false);

  const cleanImageUrl = imageUrl?.trim() || "";
  const cleanVideoUrl = videoUrl?.trim() || "";

  // Derive actual active media type
  const isVideo = mediaType === "video" || (!mediaType && cleanVideoUrl);
  const isImage = (mediaType === "image" || (!mediaType && cleanImageUrl)) && !isVideo;

  if (!isVideo && !isImage) return null;

  const videoInfo = isVideo ? parseVideoUrl(cleanVideoUrl) : null;
  const fallbackThumbnail = videoInfo?.thumbnailUrl || cleanImageUrl;

  // --- 1. CARD / THUMBNAIL MODE ---
  if (mode === "card" || mode === "thumbnail") {
    if (isVideo) {
      return (
        <div className={`relative overflow-hidden bg-slate-900 group/media ${className}`}>
          {fallbackThumbnail && !imgError ? (
            <img
              src={fallbackThumbnail}
              alt={title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-400 p-4">
              <Video size={28} className="text-red-500 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Video Bulletin</span>
            </div>
          )}

          {/* Video Overlay / Play indicator badge */}
          {showPlayBadge && (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-center justify-center pointer-events-none">
              <div className="h-10 w-10 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover/media:scale-110">
                <Play size={16} className="fill-white ml-0.5" />
              </div>
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-xs border border-white/10">
                <Video size={11} className="text-red-400" />
                <span>Video</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isImage && cleanImageUrl && !imgError) {
      return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
          <img
            src={cleanImageUrl}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      );
    }

    return null;
  }

  // --- 2. HERO / DETAIL / PREVIEW MODE ---
  if (isVideo) {
    // YouTube Embed
    if (videoInfo?.type === "youtube") {
      return (
        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md ${className}`}>
          <iframe
            src={videoInfo.embedUrl}
            title={title || "YouTube video player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    // Vimeo Embed
    if (videoInfo?.type === "vimeo") {
      return (
        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md ${className}`}>
          <iframe
            src={videoInfo.embedUrl}
            title={title || "Vimeo video player"}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // HTML5 Video (Direct URL or Base64 Data URL)
    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md flex items-center justify-center ${className}`}>
        {!videoError ? (
          <video
            controls
            playsInline
            poster={cleanImageUrl || undefined}
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain"
          >
            <source src={cleanVideoUrl} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400 text-xs">
            <AlertCircle size={28} className="text-red-500 mb-2" />
            <p className="font-semibold text-slate-200">Unable to stream video</p>
            <p className="text-slate-400 text-[11px] mt-1">Please verify the video link or upload format.</p>
          </div>
        )}
      </div>
    );
  }

  // Hero Image
  if (isImage && cleanImageUrl && !imgError) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs ${className}`}>
        <img
          src={cleanImageUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return null;
}
