import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const harish = await prisma.user.upsert({
    where: { email: "harish@example.com" },
    update: {},
    create: { email: "harish@example.com", name: "Harish", password },
  });

  const ajaia = await prisma.user.upsert({
    where: { email: "ajaia@example.com" },
    update: {},
    create: { email: "ajaia@example.com", name: "Ajaia", password },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { email: "demo@example.com", name: "Demo", password },
  });

  const doc1 = await prisma.document.upsert({
    where: { id: "seed-doc-1" },
    update: {},
    create: {
      id: "seed-doc-1",
      title: "Project Kickoff Notes",
      content:
        '<h1>Project Kickoff Notes</h1><p>Welcome to our project kickoff! Here are the key points we discussed:</p><ul><li><strong>Timeline:</strong> Q1 delivery target</li><li><strong>Team:</strong> Frontend, backend, and design</li><li><em>Next steps:</em> Schedule weekly syncs</li></ul><p>Feel free to edit and collaborate on this document.</p>',
      ownerId: harish.id,
    },
  });

  const doc2 = await prisma.document.upsert({
    where: { id: "seed-doc-2" },
    update: {},
    create: {
      id: "seed-doc-2",
      title: "Engineering RFC: Auth System",
      content:
        "<h1>RFC: Authentication System</h1><h2>Background</h2><p>We need a robust authentication system that supports multiple providers.</p><h2>Proposal</h2><p>Implement JWT-based auth with refresh tokens stored in <strong>httpOnly</strong> cookies.</p><h2>Open Questions</h2><ol><li>Token expiry duration</li><li>Refresh token rotation strategy</li></ol>",
      ownerId: harish.id,
    },
  });

  const doc3 = await prisma.document.upsert({
    where: { id: "seed-doc-3" },
    update: {},
    create: {
      id: "seed-doc-3",
      title: "Design System Guidelines",
      content:
        "<h1>Design System Guidelines</h1><p>This document outlines our design principles and component usage.</p><h2>Colors</h2><p>Primary: <strong>#4F46E5</strong> (Indigo)</p><h2>Typography</h2><p>Use Inter for body text, Geist Mono for code.</p>",
      ownerId: ajaia.id,
    },
  });

  // Share doc3 (Ajaia's) with Harish
  await prisma.share.upsert({
    where: { documentId_userId: { documentId: doc3.id, userId: harish.id } },
    update: {},
    create: { documentId: doc3.id, userId: harish.id, permission: "edit" },
  });

  // Share doc1 (Harish's) with Ajaia
  await prisma.share.upsert({
    where: { documentId_userId: { documentId: doc1.id, userId: ajaia.id } },
    update: {},
    create: { documentId: doc1.id, userId: ajaia.id, permission: "edit" },
  });

  console.log("Seed complete:", { harish, ajaia, demo, doc1, doc2, doc3 });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
