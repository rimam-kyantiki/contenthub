import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      include: { posts: { orderBy: { timestamp: "desc" } } },
    });

    if (!user) {
      return NextResponse.json({ posts: [], username: "" });
    }

    return NextResponse.json({ posts: user.posts, username: user.instagramUsername });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}