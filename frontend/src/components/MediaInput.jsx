import React, { useState } from "react";
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  Link2, 
  Trash2, 
  Play, 
  Info,
  Film
} from "lucide-react";
import MediaDisplay from "./MediaDisplay";
import { parseVideoUrl } from "../utils/mediaHelpers";

export default function MediaInput({
  label = "Cover Media & Attachments",
  mediaType = "none",
  imageUrl = "",
  videoUrl = "",
  onChange,
  onToast,
  helperText = "Optional: Upload or link images, YouTube / Vimeo videos, or video files.",
}) {
  // Determine active tab: 'image' | 'video' | 'none'
  const activeTab = mediaType === "video" || (!mediaType && videoUrl) 
    ? "video" 
    : (mediaType === "image" || (!mediaType && imageUrl)) 
      ? "image" 
      : "none";

  const handleTabChange = (tab) => {
    if (tab === "none") {
      onChange({ mediaType: "none", imageUrl: "", videoUrl: "" });
    } else if (tab === "image") {
      onChange({ mediaType: "image", videoUrl: "" });
    } else if (tab === "video") {
      onChange({ mediaType: "video" });
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        onToast?.("Image exceeds 8MB size limit", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ mediaType: "image", imageUrl: reader.result, videoUrl: "" });
        onToast?.("Image attached successfully", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        onToast?.("Video exceeds 15MB limit. For larger HD videos, paste a YouTube or Vimeo link.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ mediaType: "video", videoUrl: reader.result });
        onToast?.("Video attached successfully", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoPosterUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onToast?.("Poster image exceeds 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ imageUrl: reader.result });
        onToast?.("Custom video thumbnail attached", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const videoInfo = videoUrl ? parseVideoUrl(videoUrl) : null;

  return (
    <div className="space-y-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 p-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Film size={13} className="text-red-600" />
          <span>{label}</span>
        </label>

        {/* Media Type Segmented Control */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => handleTabChange("none")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === "none"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            None
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("image")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === "image"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon size={12} />
            <span>Image</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("video")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === "video"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <VideoIcon size={12} />
            <span>Video</span>
          </button>
        </div>
      </div>

      {helperText && activeTab === "none" && (
        <p className="text-[11px] text-slate-500 leading-normal">{helperText}</p>
      )}

      {/* --- IMAGE TAB CONTROLS --- */}
      {activeTab === "image" && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Local Image Upload */}
            <label className="cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-white hover:bg-red-50/30 text-slate-700 transition-colors text-xs font-semibold shadow-2xs">
              <Upload size={14} className="text-red-500" />
              <span>Upload Image (Max 8MB)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageFileUpload}
              />
            </label>

            {/* Direct Image URL */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 size={13} />
              </div>
              <input
                type="url"
                placeholder="Or paste image URL (https://...)"
                value={imageUrl?.startsWith("data:") ? "" : (imageUrl || "")}
                onChange={(e) => onChange({ mediaType: "image", imageUrl: e.target.value, videoUrl: "" })}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group">
              <img
                src={imageUrl}
                alt="Media preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/10">
                Image Attached
              </div>
              <button
                type="button"
                onClick={() => onChange({ mediaType: "none", imageUrl: "", videoUrl: "" })}
                className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm transition-colors"
                title="Remove image"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- VIDEO TAB CONTROLS --- */}
      {activeTab === "video" && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div className="space-y-2">
            {/* Video Link Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 size={13} />
              </div>
              <input
                type="url"
                placeholder="Paste YouTube, Vimeo, or direct MP4/WebM URL (e.g. https://youtu.be/...)"
                value={videoUrl?.startsWith("data:") ? "" : (videoUrl || "")}
                onChange={(e) => onChange({ mediaType: "video", videoUrl: e.target.value })}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs font-mono"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {/* Local Video Upload */}
              <label className="cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-white hover:bg-red-50/30 text-slate-700 transition-colors text-xs font-semibold shadow-2xs">
                <Upload size={14} className="text-red-500" />
                <span>Upload Video Clip (Max 15MB)</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  className="hidden"
                  onChange={handleVideoFileUpload}
                />
              </label>

              {/* Optional Custom Poster Upload */}
              <label className="cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white text-slate-600 transition-colors text-xs font-medium shadow-2xs">
                <ImageIcon size={13} className="text-slate-400" />
                <span>Custom Poster / Thumbnail (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleVideoPosterUpload}
                />
              </label>
            </div>
          </div>

          {/* Video Provider Badge & Format Tips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 bg-white/70 rounded-xl px-3 py-1.5 border border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-slate-400" />
              <span>Supports <strong>YouTube</strong>, <strong>Vimeo</strong>, &amp; <strong>MP4/WebM</strong></span>
            </div>
            {videoInfo && (
              <span className="font-bold uppercase text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Provider: {videoInfo.type}
              </span>
            )}
          </div>

          {/* Live Video Preview Player */}
          {videoUrl && (
            <div className="relative space-y-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs">
                <MediaDisplay
                  mediaType="video"
                  videoUrl={videoUrl}
                  imageUrl={imageUrl}
                  mode="preview"
                  title="Video Preview"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  {imageUrl ? "Custom poster attached" : "Default provider thumbnail active"}
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ mediaType: "none", videoUrl: "", imageUrl: "" })}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 size={12} />
                  <span>Remove Video</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
