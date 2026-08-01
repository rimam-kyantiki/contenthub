"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { RefreshCw, Eye, EyeOff, ExternalLink, Play, Heart, MessageCircle, Globe, LogOut } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  instagramId: string;
  caption: string | null;
  mediaType: string;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
  published: boolean;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [username, setUsername] = useState("creator");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
      if (data.username) setUsername(data.username);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function syncPosts() {
    setSyncing(true);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
        alert(`Synced ${data.synced} posts!`);
      } else {
        alert(data.error || "Sync failed");
      }
    } catch (e) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function togglePost(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/posts/${id}/toggle`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => p.id === id ? { ...p, published: !current } : p));
      }
    } catch (e) {
      alert("Toggle failed");
    }
  }

  const publishedCount = posts.filter(p => p.published).length;
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">IG</div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">ContentHub</h1>
              <p className="text-xs text-neutral-400">@{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${username}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
              <Globe className="w-4 h-4" />View Blog
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📊" label="Total Posts" value={posts.length} />
          <StatCard icon="👁️" label="Published" value={publishedCount} subtext={`${posts.length - publishedCount} hidden`} />
          <StatCard icon="❤️" label="Total Likes" value={totalLikes.toLocaleString()} />
          <StatCard icon="🌐" label="Blog URL" value={`/${username}`} isLink />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Your Instagram Posts</h2>
          <button onClick={syncPosts} disabled={syncing} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Instagram"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-neutral-700 transition-all">
              <div className="relative aspect-square bg-neutral-800">
                {post.thumbnailUrl || post.mediaUrl ? (
                  <img src={post.thumbnailUrl || post.mediaUrl || ""} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">No image</div>
                )}
                {post.mediaType === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => togglePost(post.id, post.published)} className={`px-4 py-2 rounded-lg text-sm font-medium backdrop-blur ${post.published ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {post.published ? <EyeOff className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
                    {post.published ? "Unpublish" : "Publish"}
                  </button>
                  <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />IG
                  </a>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-neutral-300 line-clamp-2 mb-3">{post.caption || "No caption"}</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${post.published ? "bg-green-400" : "bg-neutral-600"}`} />
                  <span className={`text-xs ${post.published ? "text-green-400" : "text-neutral-500"}`}>{post.published ? "Published to Blog" : "Hidden from Blog"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">Click &quot;Sync from Instagram&quot; to fetch your content</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, subtext, isLink }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <p className="text-sm text-neutral-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${isLink ? "text-pink-400" : ""}`}>{value}</p>
      {subtext && <p className="text-xs text-neutral-500 mt-1">{subtext}</p>}
    </div>
  );
}