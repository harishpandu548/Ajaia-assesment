# AI Workflow Note

## Tools Used

- **Chatgpt and claude

## Where AI Materially Sped Up Work

**Boilerplate elimination.** The most significant time savings came from not hand-typing repetitive but correct code. The API routes (`documents/route.ts`, `[id]/route.ts`, `[id]/share/route.ts`) follow a consistent access-control pattern — check session, find document, verify ownership/share, execute query. AI scaffolded all of these in one pass with the correct structure, which would have taken 30–40 minutes to write by hand.

**Component structure.** The ShareModal and UploadModal components involve a fair amount of state management (search debounce, optimistic list updates, error states, loading states). AI produced the initial working versions that I then refined for UX details.

**CSS prose styles.** Writing the `.prose` styles for TipTap's editor output (headings, lists, blockquotes, code blocks) is mechanical work. AI generated these in a single pass based on my description of the desired visual style.

**Debugging breaking changes.** Prisma v7 introduced a breaking change (no `url` in `schema.prisma`) and Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. Both surfaced as build errors. In both cases AI identified the root cause and the correct fix from the error output alone — saved significant documentation-digging.

## What I Changed or Rejected

**Prisma v7 config approach.** AI initially attempted to use the Prisma v7 `prisma.config.ts` format with a `@prisma/adapter-libsql` adapter. After checking the error output and the complexity involved, I chose to downgrade to Prisma v5 instead — a simpler, more battle-tested path for this timebox.

**TipTap `setContent` API call.** AI generated `editor.commands.setContent(content, false, { preserveWhitespace: "full" })` — the three-argument form doesn't exist in TipTap v3. Caught by `tsc --noEmit` and corrected to the one-argument form.

**`TextStyle` import.** AI generated `import TextStyle from "@tiptap/extension-text-style"` (default import). The package only has a named export in v3: `import { TextStyle } from ...`. Again, caught by TypeScript.

**Auto-save delay.** AI suggested a 2-second debounce. I reduced it to 1.5s — it feels more responsive and the PUT request is lightweight.

## How I Verified Correctness

1. **TypeScript** — `npx tsc --noEmit` before every build. Zero errors before pushing to the build step.
2. **Build** — `npm run build` confirms route compilation, static generation, and no runtime import errors.
3. **Manual testing flow:**
   - Login as alice → see owned docs + shared doc from Bob
   - Open a document → edit content with all formatting tools → verify auto-save fires
   - Share a document → search by email → add Bob → verify he appears in the shared list
   - Login as Bob → verify the shared document appears in "Shared with me"
   - Open the shared doc as view-only user → verify toolbar is hidden and title is disabled
   - Upload a .txt file → verify it appears as a new document with correct content
   - Upload a .md file → verify headings and bold text are correctly rendered
4. **Database** — Inspected the seed output to confirm correct relational data before testing auth flows.

## Judgment Calls Made Independently

- Chose SQLite over Postgres for zero-config local setup (clearly documented tradeoff in README)
- Chose HTML as content storage format over TipTap's native JSON — simpler, portable
- Chose debounced auto-save over explicit save button — better UX for a document editor
- Kept the markdown→HTML converter inline (20 lines) rather than adding a full Markdown library — sufficient for the file upload use case and keeps the bundle small
