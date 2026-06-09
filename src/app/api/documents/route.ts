import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: {
        shares: { some: { userId } },
        ownerId: { not: userId },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: { where: { userId }, select: { permission: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ owned, shared });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title = "Untitled Document", content = "" } = body;

  const document = await prisma.document.create({
    data: {
      title: String(title).trim() || "Untitled Document",
      content: String(content),
      ownerId: session.user.id,
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(document, { status: 201 });
}
