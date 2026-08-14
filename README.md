# DonateBridge — Physical Donation Management System

An end-to-end platform for donating **physical items** (books, school bags,
clothes, blankets, toys, etc.) to NGOs — not a payments app. Donors upload a
photo, an AI detection step suggests items/quantities, the donor reviews and
corrects them, a transparent rule-based matching algorithm suggests NGOs, and
the donor/NGO/admin then move the request through accept → handover → complete.

## ⚠️ Honesty about what's been tested

This sandbox has **no network access**, so I could not run `pip install` /
`npm install` or actually boot the servers while building this. Every file
was hand-written and syntax-checked (`python3 -m py_compile` on all backend
files; `node --check` + brace/paren balance checks on all frontend files),
but **the full request/response cycle has not been executed end-to-end**.
Treat this as a strong, complete first draft: budget time for the normal
"first run" debugging any real project needs (missing import, a typo'd URL
name, etc.) — I've tried to eliminate those, but I can't promise zero.

## What's real vs. scoped down

Real and complete:
- Django models, migrations-ready schema, JWT auth with role gating, NGO
  approval workflow, donation + item CRUD with server-side ownership checks,
  a pluggable AI detection service, an explainable rule-based NGO matching
  algorithm, donation-request state machine with enforced transitions,
  notifications, dashboards for all three roles, and a React app wired to
  all of it through a single Axios client with JWT refresh.
- Backend automated tests for auth, NGO approval gating, donation ownership,
  AI detection response shape, matching scores, and request lifecycle
  transitions.

Deliberately scoped down (documented here rather than hidden):
- **AI detection defaults to an honest "stub" backend** that returns *no*
  fabricated detections plus a clear note — because no ML libraries are
  installed in this environment and a pretrained YOLO model can only detect
  its own training classes (COCO doesn't include "blanket" or "school bag").
  Flip `AI_BACKEND=yolo` in `.env` once you `pip install ultralytics` and
  supply model weights — the whole app already calls a single
  `detect_objects()` function, so swapping in real (or later, custom-trained)
  YOLO weights doesn't touch any other code. See `apps/ai_detection/services.py`.
- Settings are one `config/settings.py` instead of a base/dev/prod split, to
  keep local setup simple — env vars already control everything that would
  differ between environments.
- SQLite is the default DB (per your setup preference) with `USE_POSTGRES=True`
  as a one-line switch to Postgres — same Django ORM either way.
- Frontend component/workflow tests are not included (backend tests are);
  add Vitest + React Testing Library specs as the next step if needed.

## Project layout

```
donation-system/
├── backend/            Django + DRF + SimpleJWT + SQLite/PostgreSQL
│   ├── config/         settings.py, urls.py, wsgi.py
│   ├── apps/
│   │   ├── accounts/        custom User model, register/login, JWT
│   │   ├── ngos/             NGO profile, requirements, admin approval
│   │   ├── donations/        Donation, DonationItem, dashboard/admin stats
│   │   ├── ai_detection/     pluggable YOLO/stub detection service
│   │   ├── matching/         explainable rule-based NGO matching
│   │   ├── donation_requests/ request lifecycle state machine
│   │   └── notifications/    in-app notifications
│   └── requirements.txt
└── frontend/            React 18 + Vite + React Router + Axios
    └── src/
        ├── api/          one module per backend resource
        ├── components/   Button, Card, Modal, FileUploader, etc.
        ├── context/       AuthContext (JWT storage + refresh)
        ├── layouts/       DashboardLayout (role-aware sidebar)
        ├── pages/donor|ngo|admin|auth
        └── routes/        ProtectedRoute (role-based access)
```

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env                # already has sane SQLite defaults
python manage.py makemigrations
python manage.py migrate
python manage.py create_admin --email admin@example.com --password ChangeMe123
python manage.py test               # run the automated test suite
python manage.py runserver          # http://127.0.0.1:8000
```

To enable real YOLO detection later:
```bash
pip install ultralytics opencv-python-headless
# in .env: AI_BACKEND=yolo, YOLO_MODEL_PATH=yolov8n.pt (or a custom-trained .pt)
```

To switch to PostgreSQL: set `USE_POSTGRES=True` and the `DB_*` vars in `.env`,
create the database (`createdb donation_system`), then re-run `migrate`.

## Frontend setup

```bash
cd frontend
npm install
cp env.example .env                # points at http://127.0.0.1:8000/api
npm run dev                         # http://localhost:5173
```

## Manual test walkthrough (matches the spec's 16-step flow)

1. Register a donor at `/register/donor`, log in.
2. Register an NGO at `/register/ngo` — note it can't log in yet.
3. Log in as the admin you created with `create_admin`.
4. Go to **Admin → NGO Applications**, approve the NGO.
5. Log in as that NGO; add a requirement (e.g. "books", qty 50, priority High).
6. Log back in as the donor, go to **Donate**, upload a photo, click
   **Analyze image** (stub backend returns an honest "no detection" result —
   this is expected without YOLO installed), add items manually, confirm.
7. Go to **NGOs**, see the confirmed donation's match score and reason,
   send a request to the NGO you approved.
8. Log in as the NGO, **Requests**, accept the request, then mark it
   handed over — this completes the donation.
9. Log back in as the donor and NGO in turn to see the notifications each
   received (approval, request received, request accepted, completed).
10. Check **Admin → Dashboard** for updated system-wide stats.

## API documentation

See `API_DOCUMENTATION.md` for every endpoint, its auth requirements, and
example request/response bodies.
