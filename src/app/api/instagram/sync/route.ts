import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const INSTAGRAM_API_URL = "https://graph.instagram.com";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user?.accessToken) {
      return NextResponse.json({ error: "No Instagram token found" }, { status: 400 });
    }

    const fields = [
      "id", "caption", "media_type", "media_url", "permalink",
      "thumbnail_url", "timestamp", "username", "comments_count", "like_count",
      "children{media_url,media_type,thumbnail_url}",
    ].join(",");

    const url = new URL(`${INSTAGRAM_API_URL}/me/media`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", user.accessToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch Instagram media");
    }

    const data = await response.json();
    const media = data.data || [];

    const results = await Promise.all(
      media.map(async (item: any) => {
        return db.post.upsert({
          where: { instagramId: item.id },
          update: {
            caption: item.caption || null,
            mediaType: item.media_type,
            mediaUrl: item.media_url || null,
            thumbnailUrl: item.thumbnail_url || null,
            permalink: item.permalink,
            timestamp: new Date(item.timestamp),
            likes: item.like_count || 0,
            comments: item.comments_count || 0,
          },
          create: {
            instagramId: item.id,
            userId: user.id,
            caption: item.caption || null,
            mediaType: item.media_type,
            mediaUrl: item.media_url || null,
            thumbnailUrl: item.thumbnail_url || null,
            permalink: item.permalink,
            timestamp: new Date(item.timestamp),
            likes: item.like_count || 0,
            comments: item.comments_count || 0,
          },
        });
      })
    );

    return NextResponse.json({ success: true, synced: results.length });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}