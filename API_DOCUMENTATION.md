# API Documentation

Base URL: `http://127.0.0.1:8000/api`
Auth: JWT bearer token in `Authorization: Bearer <access_token>` header, unless marked Public.
All errors follow: `{"detail": "..."}` or `{"detail": "Validation failed.", "errors": {"field": ["..."]}}`.

## Auth (`/auth/`)

### POST /auth/register/donor/  — Public
Request: `{ "username", "email", "password", "first_name", "last_name", "phone", "address", "city", "state", "pincode" }`
Response `201`: donor user object.

### POST /auth/register/ngo/  — Public
Request: `{ "username", "email", "password", "organization_name", "registration_number", "phone", "website", "address", "city", "state", "pincode", "description" }`
Response `201`: `{ "detail": "...pending admin approval...", "user": {...} }`
Creates `User(role=ngo, is_active=False)` + `NGO(approval_status=pending)`.

### POST /auth/login/  — Public
Request: `{ "email", "password", "role": "donor"|"ngo"|"admin" }`
Response `200`: `{ "access", "refresh", "user": {...} }`
Errors `400`: wrong credentials, role mismatch, or (for NGO) not yet approved.

### POST /auth/token/refresh/  — Public
Request: `{ "refresh" }` → Response: `{ "access" }`

### GET/PATCH /auth/me/  — Authenticated
Returns/updates the current user's profile fields (not role, not password).

## NGOs (`/ngo/`)

### GET /ngo/list/  — Authenticated
List approved NGOs (paginated).

### GET /ngo/list/<id>/  — Authenticated
Single approved NGO's public profile.

### GET/PATCH /ngo/profile/  — NGO role only
The logged-in NGO's own full profile.

### GET/POST /ngo/requirements/  — NGO role only
List/create the NGO's own requirements. POST body: `{ "item_name", "required_quantity", "priority": "low"|"medium"|"high", "description", "active" }`

### GET/PATCH/DELETE /ngo/requirements/<id>/  — NGO role, owner only

## Admin — NGO approvals (`/admin/`)

### GET /admin/ngo-applications/?status=pending  — Admin only
### GET /admin/ngo-applications/<id>/  — Admin only
### PATCH /admin/ngo-applications/<id>/approve/  — Admin only
Sets `approval_status=approved`, `user.is_active=True`, notifies the NGO.
### PATCH /admin/ngo-applications/<id>/reject/  — Admin only

## Donations (`/donations/`)

### GET/POST /donations/  — Donor role only
List the donor's own donations, or create one. POST is multipart:
`title`, `description` (optional), `image` (optional file).
Ownership (`donor`) is always set from the authenticated request — never
trusted from the client body.

### GET/PATCH/DELETE /donations/<id>/  — Donor role, owner only

### GET/POST /donations/<id>/items/  — Donor role, owner only
POST body: `{ "item_name", "quantity", "confidence" (optional) }`

### GET/PATCH/DELETE /donations/<id>/items/<item_id>/  — Donor role, owner only
Editing an AI-sourced item automatically flips its `source` to `edited`.

### POST /donations/<id>/confirm/  — Donor role, owner only
Moves a `draft` donation with ≥1 item to `confirmed`. Errors `400` if no items
or already confirmed — status can never be set directly via PATCH.

### GET /donations/stats/dashboard/  — Donor role only
`{ total_donations, pending_donations, completed_donations, active_requests, recent_donations }`

### GET /admin-stats/stats/  — Admin only
`{ total_donors, total_ngos, pending_ngo_approvals, total_donations, active_donations, pending_requests, completed_donations }`

## AI detection (`/ai/`)

### POST /ai/detect/  — Authenticated
multipart body: `image=<file>` (jpg/png/webp, ≤10MB).
Response `200`:
```json
{
  "detections": [{"class_name": "books", "confidence": 0.94, "bbox": [x1,y1,x2,y2]}],
  "counts": {"books": 8},
  "model": "stub-v1 (no ML backend installed)",
  "threshold": 0.25,
  "note": "AI_BACKEND is set to 'stub'..."
}
```
Errors: `400` invalid/oversized/wrong-format image; `422` model/inference
failure with a clean message; `500` unexpected failure (never a traceback).

## Matching (`/matching/`)

### GET /matching/donations/<donation_id>/  — Donor role, owner only
Response: `{ "donation": id, "matches": [{"ngo", "ngo_name", "match_score", "matched_items", "reason"}, ...] }`
Rule-based and explainable — see `apps/matching/services.py` for the exact
scoring formula (item overlap 50pts + quantity coverage 35pts + priority weight 15pts).

## Donation requests (`/requests/`)

### GET/POST /requests/  — Donor or NGO role
Donors see their own sent requests; NGOs see requests sent to them.
POST (donor only) body: `{ "donation": id, "ngo": id, "message": "..." }`
— requires the donation to be `confirmed` first.

### GET /requests/<id>/  — Donor or NGO role, participant only

### POST /requests/<id>/accept/  — NGO role, owner only
### POST /requests/<id>/reject/  — NGO role, owner only
### POST /requests/<id>/complete/  — NGO role, owner only
Valid transitions only: `pending → accepted|rejected|cancelled`,
`accepted → completed|cancelled`. Invalid transitions return `400`.
Completing a request marks the donation `completed`.

## Notifications (`/notifications/`)

### GET /notifications/  — Authenticated
The current user's notifications, newest first.

### PATCH /notifications/<id>/read/  — Authenticated, owner only
Marks a notification read.
