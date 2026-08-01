import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Play, Heart, MessageCircle, ArrowUpRight } from "lucide-react";

interface Props {
  params: { username: string };
}

export default async function BlogPage({ params }: Props) {
  const user = await db.user.findUnique({
    where: { instagramUsername: params.username },
    include: {
      posts: { where: { published: true }, orderBy: { timestamp: "desc" } },
      blogSettings: true,
    },
  });

  if (!user) notFound();

  const totalLikes = user.posts.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 mx-auto mb-6 flex items-center justify-center text-3xl font-bold">
          {(user.name || user.instagramUsername || "?").charAt(0).toUpperCase()}
        </div>
        <h1 className="text-4xl font-bold mb-2">{user.name || user.instagramUsername}</h1>
        <p className="text-neutral-400 text-lg mb-2">@{user.instagramUsername}</p>
        <p className="text-neutral-500 max-w-lg mx-auto mb-6">{user.blogSettings?.description}</p>
        <div className="flex justify-center gap-6 text-sm">
          <span className="text-neutral-400"><strong className="text-white text-lg">{user.posts.length}</strong> posts</span>
          <span className="text-neutral-400"><strong className="text-white text-lg">{totalLikes.toLocaleString()}</strong> likes</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
        {user.posts.map((post) => (
          <article key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-square md:aspect-auto bg-neutral-800 min-h-[300px]">
                {post.thumbnailUrl || post.mediaUrl ? (
                  <img src={post.thumbnailUrl || post.mediaUrl || ""} alt={post.caption || "Post"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">No image</div>
                )}
                {post.mediaType === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-8 h-8 text-neutral-900 ml-1" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs font-medium text-neutral-400">{post.mediaType}</span>
                  <span className="text-xs text-neutral-500">{format(new Date(post.timestamp), "MMMM d, yyyy")}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 leading-tight line-clamp-3">
                  {post.caption?.split(".")[0] || post.caption?.substring(0, 80) || "Untitled Post"}
                  {(post.caption?.length || 0) > 80 ? "..." : ""}
                </h2>
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-4">{post.caption || "No caption provided."}</p>
                <div className="flex items-center gap-4">
                  <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    View on Instagram <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <div className="flex gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{post.likes}</span>
                    <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {user.posts.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg">No published posts yet</p>
            <p className="text-sm mt-2">The creator hasn&apos;t published any content to their blog</p>
          </div>
        )}
      </div>

      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p>Powered by ContentHub</p>
      </footer>
    </div>
  );
}