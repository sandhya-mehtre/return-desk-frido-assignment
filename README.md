# ReturnDesk

A returns desk for a small online store — built as a frontend-only implementation.

**Live demo:** - https://returndesk.netlify.app/

## Important: scope of this submission

This assignment specifies Node.js + PostgreSQL as mandatory backend technology.
This submission does **not** include a backend or database. All state (return
requests, notes, status transitions) lives in Redux Toolkit state, persisted to
the browser's localStorage via redux-persist. This is done becasue I do have 
experience only in Frontend development as of now and NOT in Backend development. 
but as I go ahead in my learning journey I would like to make this as complete 
full-stack application. 

This was a deliberate scope decision to focus my available time on frontend
architecture, state management and business-rule logic in the UI layer. I'm
aware this means:

- Data does not persist across different browsers/devices, and is lost if
  localStorage is cleared.
- Business rules (status transitions, resolution validation, duplicate
  detection, locking, removal) are enforced only in client-side code
  (`src/lib/domain/rules.ts`), not on a server. They can be bypassed by
  calling Redux actions directly from the browser console — there is no API
  to "test directly" as the brief describes, since no API exists.
- The "Business rules enforced on the server," "Data model," and "API design"
  scoring areas do not apply to this build in their intended form.

I made this trade-off knowingly rather than submitting an incomplete backend.
What follows documents what *is* fully working.

## What's implemented

- Raising a return request, with a system-generated reference (never
  user-entered)
- Server-side-equivalent search, filter, sort and pagination — done via plain
  array operations against Redux state (see `src/lib/redux/selectors.ts`)
- Full request detail view: all fields, full note history in order
- Status lifecycle enforcement: Open → In Review → Approved/Rejected →
  Completed, with illegal transitions impossible to trigger from the UI
- Approval requires a resolution (Refund / Replacement / Store Credit); Refund
  requires an amount > 0; other resolutions forbid an amount
- One live request per (order, item) pair — duplicate creation blocked with a
  visible error
- Editing locked once a request reaches Approved / Rejected / Completed
- Soft removal — only allowed from Open or Rejected; removed requests
  disappear from the list but remain in the Redux store (equivalent of a
  `deleted_at` flag)
- Notes: append-only, timestamped, never edited or deleted
- Loading / empty / error states on the list page
- Debounced search (300ms) — does not fire on every keystroke
- Responsive down to 375px width
- Seed data: 32 requests generated on first load, spread across every status
  and reason, with notes on roughly a third

## What's not implemented

- No backend, no database, no API — see scope note above
- No authentication (brief implies a single agent, so this wasn't built)
- No automated tests

## Design decisions

- **State shape**: a single flat array of request objects in one Redux slice,
  each carrying its own notes array. No normalization (no separate notes
  table/entity) since the dataset is small and every note is always read in
  the context of its parent request.
- **Reference generation**: `RD-<year>-<sequential>`, generated at creation
  time in `generateReference()`, never exposed as an editable field.
- **Rules module**: all business logic (`src/lib/domain/rules.ts`) is pure
  functions with no React or Redux dependency, imported by both the list and
  detail pages, so the rule for e.g. "what's the next legal status" exists in
  exactly one place.
- **No order/customer entities**: order and customer details are stored as
  plain fields on each request rather than as separate normalized tables/
  entities, since the brief doesn't require managing orders or customers
  independently of a return request.

## Tech stack

- Next.js (App Router) + React, TypeScript
- Redux Toolkit + redux-persist (localStorage)
- Tailwind CSS

## Setup

```bash
git clone https://github.com/sandhya-mehtre/return-desk-frido-assignment.git
cd return-desk-frido-assignment
npm install
npm run dev
```

Open `http://localhost:3000`. Seed data loads automatically into Redux state
on first visit (see `src/lib/redux/seedData.ts`), no separate seed command
needed since there's no database to seed.

## AI tool usage

I used AI assistance to scaffold the Redux/Next.js project structure and
draft the business-rules module, list/detail/create pages, and this README.
I reviewed, tested and adjusted the generated code myself, and can walk
through and defend any part of it. 

## Time spent

- spent around 12 hours working on overall application from frontend side
from development to sanity testing all features present. 

## Additional features which I have implemented which are NOT part of scope 

- 1. Timeline page functionality 
- 2. Restoring soft-deleted requests
