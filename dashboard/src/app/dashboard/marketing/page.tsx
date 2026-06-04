"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import {
  Send,
  CalendarClock,
  RefreshCw,
  Globe,
  Image,
  Video,
  X,
  Eye,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const SERVICE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  x: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  threads: "Threads",
  facebook: "Facebook",
  pinterest: "Pinterest",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  googleBusiness: "Google Business",
};

const SERVICE_COLORS: Record<string, string> = {
  instagram: "ring-pink-500/30 bg-pink-500/10 text-pink-400",
  twitter: "ring-sky-500/30 bg-sky-500/10 text-sky-400",
  x: "ring-sky-500/30 bg-sky-500/10 text-sky-400",
  linkedin: "ring-blue-600/30 bg-blue-600/10 text-blue-400",
  youtube: "ring-red-500/30 bg-red-500/10 text-red-400",
  tiktok: "ring-gray-500/30 bg-gray-500/10 text-gray-400",
  threads: "ring-white/20 bg-white/10 text-white/60",
  facebook: "ring-blue-500/30 bg-blue-500/10 text-blue-400",
};

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [postText, setPostText] = useState("");
  const [postSchedule, setPostSchedule] = useState("now");
  const [postScheduledAt, setPostScheduledAt] = useState("");
  const [mediaItems, setMediaItems] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [broadcastResults, setBroadcastResults] = useState<any[] | null>(null);

  const { data: orgs } = useQuery({
    queryKey: ["buffer", "organizations"],
    queryFn: async () => {
      const { data } = await api.get("/buffer/organizations");
      return data;
    },
  });

  const organizationId = selectedOrgId || orgs?.[0]?.id || "";

  const { data: channels } = useQuery({
    queryKey: ["buffer", "channels", organizationId],
    queryFn: async () => {
      const { data } = await api.get("/buffer/channels", { params: { organizationId } });
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["buffer", "posts", organizationId],
    queryFn: async () => {
      const { data } = await api.get("/buffer/posts", { params: { organizationId, first: 20 } });
      return data;
    },
    enabled: !!organizationId,
  });

  const broadcast = useMutation({
    mutationFn: async () => {
      setBroadcastResults(null);
      const { data } = await api.post("/buffer/broadcast", {
        organizationId,
        text: postText,
        scheduledAt: postSchedule === "scheduled" && postScheduledAt
          ? new Date(postScheduledAt).toISOString()
          : undefined,
        mediaUrls: mediaItems.map((m) => m.url),
      });
      return data;
    },
    onSuccess: (results) => {
      setBroadcastResults(results);
      const succeeded = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;
      if (failed === 0) {
        toast.success(`Posted to ${succeeded} channel${succeeded > 1 ? "s" : ""}!`);
      } else {
        toast.warning(`Posted to ${succeeded}, failed on ${failed}`);
      }
      setPostText("");
      setMediaItems([]);
      queryClient.invalidateQueries({ queryKey: ["buffer", "posts"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Broadcast failed");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const form = new FormData();
        form.append("file", file);

        const { data } = await api.post("/upload", form);
        const isVideo = file.type.startsWith("video/");
        setMediaItems((prev) => [...prev, { url: data.url, type: isVideo ? "video" : "image" }]);
      }
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Upload failed");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const posts = (postsData?.edges || []).map((e: any) => e.node);
  const activeChannels = (channels || []).filter((c: any) => !c.isDisconnected && !c.isLocked);
  const totalActive = activeChannels.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Marketing — Buffer</h2>
        <p className="text-sm text-[#666] mt-1">Broadcast posts to all connected social channels at once.</p>
      </div>

      {orgs?.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-[#666] font-medium">Organization:</label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 appearance-none"
          >
            {orgs.map((o: any) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#38bdf81a] flex items-center justify-center">
                <Send size={20} className="text-[#38bdf8]" />
              </div>
              <div>
                <h3 className="text-white font-bold">Compose Post</h3>
                <p className="text-xs text-[#666]">
                  Will be sent to <span className="text-white font-semibold">{totalActive}</span> active channel{totalActive > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#666] font-medium mb-1.5 block">Content</label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={5}
                  placeholder="What do you want to share?"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 resize-none placeholder:text-[#444]"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-[#444]">{postText.length} characters</p>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-[10px] text-[#555] hover:text-white transition-colors"
                  >
                    <Eye size={12} />
                    {showPreview ? "Hide" : "Show"} preview
                  </button>
                </div>
              </div>

              {/* Preview */}
              {showPreview && postText && (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{postText}</p>
                  {mediaItems.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {mediaItems.map((m, i) =>
                        m.type === "video" ? (
                          <video key={i} src={m.url} className="w-24 h-24 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <img key={i} src={m.url} alt="" className="w-24 h-24 rounded-lg object-cover border border-white/10" />
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Media upload */}
              <div>
                <label className="text-xs text-[#666] font-medium mb-1.5 block">Media (images & videos)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {mediaItems.map((m, i) => (
                    <div key={i} className="relative group">
                      {m.type === "video" ? (
                        <video src={m.url} className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <img src={m.url} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                      )}
                      <div className="absolute top-0 left-0 bg-black/50 text-[9px] px-1 rounded-br-lg text-white/70">
                        {m.type === "video" ? "VIDEO" : "IMG"}
                      </div>
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                  >
                    {uploadingFile ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploadingFile ? "Uploading..." : "Upload file"}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-[10px] text-[#444] mt-1.5">Supports JPG, PNG, GIF, WebP, MP4, MOV, AVI (max 50MB each)</p>
              </div>

              <div>
                <label className="text-xs text-[#666] font-medium mb-1.5 block">Schedule</label>
                <select
                  value={postSchedule}
                  onChange={(e) => setPostSchedule(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 appearance-none"
                >
                  <option value="now">Publish now</option>
                  <option value="scheduled">Schedule for later</option>
                </select>
                {postSchedule === "scheduled" && (
                  <input
                    type="datetime-local"
                    value={postScheduledAt}
                    onChange={(e) => setPostScheduledAt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 mt-2"
                  />
                )}
              </div>

              <button
                onClick={() => broadcast.mutate()}
                disabled={!postText.trim() || broadcast.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold bg-[#38bdf8] text-black hover:bg-[#38bdf8]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {broadcast.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Broadcasting to {totalActive} channels...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {postSchedule === "now"
                      ? `Broadcast to ${totalActive} channel${totalActive > 1 ? "s" : ""}`
                      : `Schedule for ${totalActive} channel${totalActive > 1 ? "s" : ""}`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Broadcast results */}
          {broadcastResults && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Broadcast Results</h3>
              <div className="space-y-2">
                {broadcastResults.map((r: any) => (
                  <div key={r.channelId} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02]">
                    {r.success ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                    )}
                    <span className="text-sm text-white/80">{r.channelName}</span>
                    {!r.success && (
                      <span className="text-xs text-red-400 ml-auto">{r.error}</span>
                    )}
                    {r.success && (
                      <span className="text-xs text-emerald-400 ml-auto">Posted</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Active Channels</h3>
              <span className="text-xs text-[#555]">{totalActive} connected</span>
            </div>
            <div className="space-y-2">
              {activeChannels.map((ch: any) => (
                <div
                  key={ch.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ring-1 ${
                    SERVICE_COLORS[ch.service] || "ring-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {ch.avatar ? (
                      <img src={ch.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Globe size={14} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{ch.name}</p>
                    <p className="text-[10px] opacity-60 truncate">{SERVICE_LABELS[ch.service] || ch.service}</p>
                  </div>
                </div>
              ))}
              {activeChannels.length === 0 && (
                <p className="text-[#555] text-sm text-center py-6">No active channels</p>
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarClock size={16} className="text-[#a855f7]" />
              <h3 className="text-sm font-bold text-white">Recent Posts</h3>
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw size={18} className="animate-spin text-white/20" />
              </div>
            ) : posts.length === 0 ? (
              <p className="text-[#555] text-sm text-center py-8">No posts yet</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                        {post.channel?.avatar ? (
                          <img src={post.channel.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Globe size={12} className="text-white/30" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-semibold text-white/50">{post.channel?.name || post.channelService}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            post.status === "sent" ? "bg-emerald-500/10 text-emerald-400" :
                            post.status === "draft" ? "bg-white/10 text-white/40" :
                            "bg-amber-500/10 text-amber-400"
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2">{post.text}</p>
                        <p className="text-[9px] text-[#444] mt-1">
                          {post.dueAt
                            ? new Date(post.dueAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                            : post.sentAt
                            ? new Date(post.sentAt).toLocaleString("en-US", { month: "short", day: "numeric" })
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
