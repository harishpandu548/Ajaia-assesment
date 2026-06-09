import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
  }

  const shares = await prisma.share.findMany({
    where: { documentId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(shares);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId, permission = "edit" } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (!["view", "edit"].includes(permission)) {
    return NextResponse.json({ error: "permission must be view or edit" }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot share with yourself" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const share = await prisma.share.upsert({
    where: { documentId_userId: { documentId: id, userId } },
    update: { permission },
    create: { documentId: id, userId, permission },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(share, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId param required" }, { status: 400 });
  }

  await prisma.share.deleteMany({ where: { documentId: id, userId } });
  return NextResponse.json({ success: true });
}
