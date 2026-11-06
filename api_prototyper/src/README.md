# SnapCircle API – Express Prototype

A working Express.js prototype of the SnapCircle collaborative photo album API, built from [api_specification.yaml](../api_specification.yaml) ([JSON version](../api_specification.json)). Group owners create groups and scheduled events, and members and guests upload photos to a shared album for each event.

Data is kept in memory, so everything resets when the server restarts.

## Requirements
- Node.js 20 or later
- npm

## Setup
```bash
cd api_prototyper/src
npm install
npm start
```

The API runs at `http://localhost:3000/api/v1`. Use `npm run dev` instead to restart automatically when `index.js` changes.

### Configuration
Set these as environment variables before starting the server. All are optional.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `JWT_SECRET` | development secret | Key used to sign JWTs. Set your own for anything shared |
| `APP_URL` | `http://localhost:5173` | Web app address used to build invite links |
| `ADMIN_EMAIL` | none | An account registered with this email gets the admin role |

```bash
JWT_SECRET=$(openssl rand -hex 32) ADMIN_EMAIL=you@example.com npm start
```

## Quick Test
With the server running, this registers an owner, creates a group, an event and an album, uploads a photo and lists the album. Replace `photo.jpg` with any JPEG on your machine.

```bash
API=http://localhost:3000/api/v1
json() { node -pe "JSON.parse(require('fs').readFileSync(0)).$1"; }

# 1. Register and keep the token
TOKEN=$(curl -s -X POST $API/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Sam","email":"sam@example.com","password":"password123"}' | json access_token)
AUTH="Authorization: Bearer $TOKEN"

# 2. Create a group
GROUP=$(curl -s -X POST $API/groups -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"name":"Beach Wedding","max_members":10}' | json id)

# 3. Create an event in the group
EVENT=$(curl -s -X POST $API/groups/$GROUP/events -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"name":"Reception","starts_at":"2026-12-12T17:00:00+10:00","ends_at":"2026-12-12T23:00:00+10:00","timezone":"Australia/Sydney"}' | json id)

# 4. Create the event's album
ALBUM=$(curl -s -X POST $API/events/$EVENT/album -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"title":"Reception Photos","max_photos":100,"max_photos_per_person":10}' | json id)

# 5. Upload a photo with a filter
curl -s -X POST $API/albums/$ALBUM/photos -H "$AUTH" \
  -F "file=@photo.jpg;type=image/jpeg" -F filter=warm -F rotation=90

# 6. List the album's photos
curl -s "$API/albums/$ALBUM/photos?page=1&limit=10" -H "$AUTH"
```

To try a guest, get the group's invite code with `curl -s $API/groups/$GROUP -H "$AUTH"`, then join without an account:

```bash
curl -s -X POST $API/auth/guest -H 'Content-Type: application/json' \
  -d '{"invite_code":"<invite_code>","display_name":"Aunt May"}'
```

## Endpoints
All paths start with `/api/v1`. Every endpoint except the three `/auth` routes needs a JWT.

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/auth/register` | Anyone | Create an account, returns a JWT |
| POST | `/auth/login` | Anyone | Log in, returns a JWT |
| POST | `/auth/guest` | Anyone | Join a group with an invite code as a guest, returns a guest JWT |
| GET | `/groups` | Member, guest | List your groups (paginated) |
| POST | `/groups` | Member | Create a group, you become its owner |
| POST | `/groups/join` | Member | Join a group with an invite code |
| GET | `/groups/{groupId}` | Group | Get a group |
| PATCH | `/groups/{groupId}` | Owner | Update the name or member limit |
| DELETE | `/groups/{groupId}` | Owner | Delete the group with its events, albums and photos |
| POST | `/groups/{groupId}/invite-code` | Owner | Issue a new invite code, the old one stops working |
| DELETE | `/groups/{groupId}/invite-code` | Owner | Turn off the invite code |
| GET | `/groups/{groupId}/events` | Group | List events (paginated) |
| POST | `/groups/{groupId}/events` | Owner | Create an event |
| GET | `/events/live` | Member, guest | Event happening now, or `204` if none |
| GET | `/events/{eventId}` | Group | Get an event |
| PATCH | `/events/{eventId}` | Owner | Update an event |
| DELETE | `/events/{eventId}` | Owner | Delete an event and its album |
| POST | `/events/{eventId}/album` | Owner | Create the event's album |
| GET | `/albums/{albumId}` | Group | Get an album, with photo count and your remaining uploads |
| PATCH | `/albums/{albumId}` | Owner | Update title, limits or privacy |
| GET | `/albums/{albumId}/photos` | Group | List photos, newest first (paginated) |
| POST | `/albums/{albumId}/photos` | Group | Upload a photo (`multipart/form-data`) |
| GET | `/photos/{photoId}` | Group | Get photo details |
| GET | `/photos/{photoId}/file` | Group | Download the original image |
| PATCH | `/photos/{photoId}` | Uploader | Change filter, rotation or crop |
| DELETE | `/photos/{photoId}` | Uploader, owner | Delete a photo |

"Group" means anyone in the group: owner, member or guest. Admins can do anything an owner can.

### Photo Uploads
Send `multipart/form-data` with these fields:
- `file` (required): JPEG, PNG, HEIC or WebP, 25 MB maximum
- `filter`: `none`, `vivid`, `warm`, `cool`, `mono` or `vintage`
- `rotation`: `0`, `90`, `180` or `270`
- `crop`: JSON such as `{"x":0,"y":0,"width":0.5,"height":0.5}`, as fractions of the image size

The upload returns `202` with `status: "processing"`, which changes to `ready` about a second later.

## Authentication
Send the token from `/auth/register`, `/auth/login` or `/auth/guest` in every request:

```
Authorization: Bearer <access_token>
```

- Account tokens last 24 hours.
- Guest tokens only work for the group they joined, and last until a day after the group's last event ends (at least one day).
- A missing, invalid or expired token returns `401`.

## Pagination
List endpoints take `page` (default `1`) and `limit` (default `10`, maximum `100`):

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 10, "total_items": 42, "total_pages": 5 }
}
```

## Errors
Every error has the same shape, and validation errors list every invalid field at once:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request is invalid",
    "details": [{ "field": "ends_at", "issue": "must be after starts_at" }]
  }
}
```

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, query or file |
| 401 | `UNAUTHORIZED` | Missing, invalid or expired token, or wrong password |
| 403 | `FORBIDDEN` | Not in the group, or not allowed to do this |
| 404 | `NOT_FOUND` | Resource, invite code or route does not exist |
| 409 | `CONFLICT` | Email already registered, or event already has an album |
| 413 | `PAYLOAD_TOO_LARGE` | Photo over 25 MB |
| 422 | `LIMIT_REACHED` | Group full, album full, per-person limit reached, or plan limit exceeded |
| 429 | `RATE_LIMITED` | Too many requests, see the `Retry-After` header |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## Limits
| Plan | Members per group | Photos per album |
|---|---|---|
| Free | 20 | 100 |
| Plus | 100 | 1,000 |
| Pro | 500 | 10,000 |

New groups start on the free plan. Owners can set a lower member limit per group and lower photo limits per album.

| Rate limit | Applies to |
|---|---|
| 10 per minute per IP address | Each of register, login and guest join |
| 100 per minute per user or guest | All authenticated requests |
| 30 per minute per user or guest | Photo uploads |

## Prototype Limitations
- All data, including uploaded photos, is held in memory and lost on restart.
- Rate limits are counted in memory, so they only work with a single server process.
- Background processing is simulated: photos are not resized, location data is not removed, and no thumbnails are made.
- Not built yet: album ZIP download, plan upgrades and payments, and real-time updates over WebSocket.
