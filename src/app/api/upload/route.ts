import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { textToHtml, markdownToHtml, titleFromFilename } from "@/lib/converters";

const SUPPORTED_TYPES = ["text/plain", "text/markdown", "text/x-markdown"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const isMarkdown = file.name.endsWith(".md") || file.name.endsWith(".markdown");
  const isText = file.name.endsWith(".txt");

  if (!isText && !isMarkdown && !SUPPORTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a .txt or .md file." },
      { status: 400 }
    );
  }

  const text = await file.text();
  const content = isMarkdown ? markdownToHtml(text) : textToHtml(text);

  const document = await prisma.document.create({
    data: {
      title: titleFromFilename(file.name),
      content,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ id: document.id, title: document.title }, { status: 201 });
}
