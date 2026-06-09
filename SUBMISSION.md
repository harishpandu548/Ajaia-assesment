# Submission

## What's Included

| File / Folder | Description |
|---------------|-------------|
| `src/` | Full application source (Next.js App Router) |
| `prisma/` | Prisma schema + seed script |
| `.env` | Local environment variables (safe for dev; change secret for prod) |
| `README.md` | Local setup and run instructions |
| `ARCHITECTURE.md` | Architecture decisions and tradeoffs |
| `AI_WORKFLOW.md` | AI tool usage and verification approach |
| `SUBMISSION.md` | This file |

## Test Accounts

| Name | Email | Password |
|------|-------|----------|
| Alice Johnson | alice@example.com | password123 |
| Bob Smith | bob@example.com | password123 |
| Charlie Davis | charlie@example.com | password123 |

## Seeded Demo Data

- **Alice** owns "Project Kickoff Notes" and "Engineering RFC: Auth System"
- **Bob** owns "Design System Guidelines" (shared with Alice — edit access)
- "Project Kickoff Notes" is shared with Bob (edit access)
- **Charlie** has no documents — clean slate for testing document creation

## What Works End-to-End

- [x] Login / logout with credentials auth
- [x] Document list page (owned + shared sections)
- [x] Create new document
- [x] Rich text editing: bold, italic, underline, strikethrough, headings (H1–H3), bullet lists, ordered lists, blockquotes, text alignment, highlight, undo/redo
- [x] Auto-save with debounce (1.5s) and visible save state indicator
- [x] Rename document (inline title edit)
- [x] Delete owned document (with confirmation)
- [x] Share document by email lookup
- [x] Set share permission (view or edit)
- [x] Remove share access
- [x] View-only mode enforced for viewers (toolbar hidden, title disabled)
- [x] Upload .txt file → creates new document
- [x] Upload .md file → markdown converted to HTML, creates new document
- [x] Documents persist across refresh

## What's Intentionally Out of Scope

- **Real-time collaboration** — Requires WebSocket infrastructure (Liveblocks/Yjs); not feasible in the timebox
- **.docx upload** — `mammoth.js` adds complexity and bundle size; .txt and .md cover the stated requirement
- **Email notifications** for share invites
- **Document versioning / history**
- **Comments or suggestions**
- **Full-text search**

## What I'd Add Next (2–4 hours)

1. Real-time multiplayer cursors and sync via Liveblocks or PartyKit
2. .docx file import via `mammoth.js`
3. Document version history with diff view
4. Full-text search across document content
