# Submission

## Deliverables

| Item | Location |
|------|----------|
| Source code | This repository |
| Setup instructions | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| Live deployment | https://ajaia-assesment-blush.vercel.app/login
| Walkthrough video | https://www.loom.com/share/de1e895142da4c79baced1f03030d86e
---

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

---

## Test Accounts

All accounts use password: `password123`

| Name | Email | Password |
|------|-------|----------|
| Harish | harish@example.com | password123 |
| Ajaia | ajaia@example.com | password123 |
| Demo | demo@example.com | password123 |

---

## Seeded Demo Data

- **Harish** owns "Project Kickoff Notes" and "Engineering RFC: Auth System"
- **Ajaia** owns "Design System Guidelines" — shared with Harish (edit access)
- "Project Kickoff Notes" is shared with Ajaia (edit access)
- **Demo** has no documents — clean slate for testing document creation

To demonstrate sharing: log in as Harish, open any document, click **Share**, search `ajaia@example.com`.
To see the shared view: log in as Ajaia — "Design System Guidelines" appears under "Shared with me" with "by Harish" attribution.

---

## What Works End-to-End

- [x] Login / logout with credentials auth
- [x] Document list page with "My Documents" and "Shared with me" sections
- [x] Create new document
- [x] Rich text editing: bold, italic, underline, strikethrough, headings (H1–H3), bullet lists, ordered lists, blockquotes, text alignment, highlight, undo/redo
- [x] Auto-save with 1.5s debounce and visible save state indicator (Saved / Saving… / Unsaved)
- [x] Rename document via inline title edit
- [x] Delete owned document (with confirmation dialog)
- [x] Share document by email lookup — owner searches by email, adds collaborator
- [x] Set share permission (view or edit) per collaborator
- [x] Remove share access
- [x] View-only mode enforced for viewers (toolbar hidden, title input disabled)
- [x] Upload `.txt` file → creates new editable document
- [x] Upload `.md` file → markdown converted to rich HTML, creates new document
- [x] Documents and sharing data persist across refresh (Neon PostgreSQL)

---

## What's Intentionally Out of Scope

- **Real-time collaboration** — Requires WebSocket infrastructure (Liveblocks/Yjs); not feasible in the timebox
- **.docx upload** — `mammoth.js` adds complexity and bundle size; `.txt` and `.md` cover the stated requirement
- **Email notifications** for share invites
- **Document versioning / history**
- **Comments or suggestions**
- **Full-text search**

---

## What I'd Add Next (2–4 hours)

1. Real-time multiplayer cursors and live sync via Liveblocks or PartyKit
2. `.docx` file import via `mammoth.js`
3. Document version history with diff view
4. Full-text search across document content
