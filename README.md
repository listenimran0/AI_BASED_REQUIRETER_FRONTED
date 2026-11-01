# Recruiter AI: frontend

React 18 + TypeScript (Vite) chat interface for the AI recruiting co-worker. The backend lives in the `recruiter-backend` repo.

## What is in here

- **Chat page** (`/`): the main way to work. The AI answers with interactive cards: an editable job confirmation form, candidate table with accept/reject buttons, email drafts you can edit and approve, reply drafts, live progress for sourcing and drafting, and a funnel summary.
- **Dashboard** (`/dashboard`) and **job page** (`/jobs/:id`): funnel, reply rate, interested rate, meetings, hires, AI cost, candidates, outreach, replies and the activity log. Status changes can be made here too.
- **Booking page** (`/book/:token`): the mock time-slot picker a candidate opens from the AI's reply.

## How it works

- Cards in a message only store ids (for example a job id or a campaign id). Each card loads its own data from the API and reloads when the server sends a change event, so a card never shows stale numbers, even after a page refresh.
- Live updates use one Server-Sent Events connection (`GET /api/events`). Chat messages, agent status and "something changed" signals all arrive on it.
- The chat id is kept in `localStorage`, so history and job data survive a refresh.

## Run it

You need the backend running first (see its README).

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:4000
npm install
npm run dev              # http://localhost:5173
```

With Docker: `docker compose up --build` here, or run everything at once from the backend repo (it expects this folder next to it, named `recruiter-frontend`).

```bash
npm run build       # type check and production build into dist/
```

## Structure

```
src/
  api.ts, events.ts       fetch helper, shared SSE connection and the useLive hook
  ui.tsx                  small shared pieces (icons, badges, toasts, modal)
  components/Message.tsx  chooses which card to draw for a message
  components/cards/       confirmation card, sourcing progress, job summary
  components/panels/      candidates table, campaign, replies, stats, activity
  pages/                  chat, dashboard, job, booking
```
