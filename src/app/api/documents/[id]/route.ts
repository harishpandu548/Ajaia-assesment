import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getDocumentAccess(docId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!document) return { document: null, access: null };

  if (document.ownerId === userId) return { document, access: "owner" };

  const share = document.shares.find((s) => s.userId === userId);
  if (share) return { document, access: share.permission };

  return { document: null, access: null };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { document, access } = await getDocumentAccess(id, session.user.id);

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ...document, access });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { document, access } = await getDocumentAccess(id, session.user.id);

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (access !== "owner" && access !== "edit") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: { title?: string; content?: string } = {};

  if (body.title !== undefined)
    updates.title = String(body.title).trim() || "Untitled Document";
  if (body.content !== undefined) updates.content = String(body.content);

  const updated = await prisma.document.update({
    where: { id },
    data: updates,
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { document, access } = await getDocumentAccess(id, session.user.id);

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (access !== "owner") {
    return NextResponse.json({ error: "Only the owner can delete" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
