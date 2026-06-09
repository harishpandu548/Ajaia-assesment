# Architecture Note

## What I Built and Why

### Framework Choice: Next.js (Full-Stack)

I chose Next.js as a single framework instead of separate frontend/backend repos. The App Router lets me colocate API routes alongside pages with shared TypeScript types. No CORS configuration, no separate deployment, and the server components handle auth/data fetching cleanly before the page renders.

### Data Model

Three tables kept simple on purpose:

```
User ──< Document  (ownerId)
User ──< Share     (userId)
Document ──< Share (documentId)
```

A `Share` row represents access: `{ documentId, userId, permission: "view" | "edit" }`. The owner is never in the `Share` table — ownership is the `Document.ownerId` field. This keeps the query to check access fast: look up the document, check `ownerId`, fall back to the Share join.

**Neon PostgreSQL via Prisma v5** — serverless Postgres that works on Vercel and any platform without extra configuration. Neon's connection pooler (the `-pooler` host in the URL) handles connection limits gracefully under serverless concurrency. No persistent disk needed.

### Auth

**NextAuth v4 with credentials provider** — JWT stored as a signed httpOnly cookie. I considered hand-rolling JWT auth with `jose`, but NextAuth handles CSRF, session rotation, and cookie security automatically. The downside is more setup; the upside is it's correct.

The proxy (`src/proxy.ts`) protects `/documents` routes by checking for the session cookie before the request reaches the page or API route. It doesn't validate the JWT (that happens in `getServerSession` inside each API route), but it prevents unauthenticated users from reaching the SSR pages at all, avoiding unnecessary DB queries.

### Rich Text Editor: TipTap

TipTap v3 wraps ProseMirror with a React API. I use `StarterKit` as the base (includes bold, italic, headings, lists, undo/redo) and added specific extensions: `Underline`, `TextAlign`, `Highlight`, `Placeholder`. Document content is stored as HTML — simpler than TipTap's JSON format, portable (can render anywhere), and survives editor version changes better.

The editor is lazy-loaded (`next/dynamic`) because ProseMirror is client-only; SSR would fail.

### Auto-Save

Saves trigger 1.5s after the user stops typing (debounced with `useRef` timers). No separate "save" button required for content — the title does also save on blur. The save state indicator (`Saved` / `Saving…` / `Unsaved changes`) gives the user confidence without being intrusive.

### File Upload

Upload handling is a Next.js API route using the Web `FormData` API (no multer). Supported types: `.txt` and `.md`. Markdown is converted to HTML with a small inline function rather than pulling in a full Markdown library — the conversion covers headings, bold, italic, lists, which is sufficient for the stated scope.

### What I Deprioritized

| Feature | Reason |
|---------|--------|
| Real-time collaboration (OT/CRDT) | Would require WebSocket infrastructure (e.g. Liveblocks, Yjs) — a full day of work alone |
| .docx upload | `mammoth.js` conversion works but adds 1MB to the bundle and the output quality varies |
| Email invites for sharing | Sharing by exact email lookup is simpler and sufficient for the demo |
| Commenting / suggestions | Out of scope for the timebox |
| Pagination | Not needed for demo data scale |

### What I'd Build Next (2–4 hours)

1. **Real-time presence** — Integrate Liveblocks or PartyKit for multiplayer cursors and live sync
2. **.docx upload** — Add `mammoth.js` for Word document import
3. **Full-text search** — SQLite FTS5 or a lightweight vector search over document content
4. **Revision history** — Store a `DocumentVersion` snapshot on each save, viewable via a diff modal
