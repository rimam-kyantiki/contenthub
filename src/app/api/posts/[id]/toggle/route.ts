import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await db.post.findFirst({
      where: { id: params.id, userId: (session.user as any).id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updated = await db.post.update({
      where: { id: params.id },
      data: { published: !post.published },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    return NextResponse.json({ error: "Toggle failed" }, { status: 500 });
  }
}