# API Requirements – SnapCircle API

## Domain
Collaborative event photo albums: groups, scheduled events, shared albums, member and guest uploads, and freemium subscriptions

## Target Users
- Group Owners: create groups and events, set album limits, invite people, manage billing
- Members: join groups, upload and edit photos, view and keep albums
- Guests: join an event by invite link or QR code, upload and view photos without an account
- Admins: moderate content and oversee the platform
- Client Developers: build the iOS, Android and web apps on top of the API

## Core Operations
- Register / log in user (returns JWT)
- Join group as guest via invite code (returns time-limited guest token)
- Create group
- Regenerate or disable group invite code
- Create event with start and end times
- Get live event for current user (album to open on app launch)
- Create album for an event with photo limits
- Upload photo with optional filter, crop and rotation
- List album photos (paginated, newest first)
- Delete photo (uploader, group owner or admin)
- Download whole album as ZIP
- Upgrade group subscription plan

## Data Rules
- Email must be unique and valid; password at least 8 characters
- Group name and event name required, 1–100 characters
- Group invite code must be unique; only the group owner can change it
- Event ends_at must be after starts_at; timezone must be a valid IANA zone
- Album max_photos must be > 0 and within the group's plan photo_limit
- max_photos_per_person must be > 0 and ≤ max_photos
- Group membership cannot exceed the plan's member_limit
- A photo must have exactly one uploader: a user or a guest, never both
- Photo files must be JPEG, PNG, HEIC or WebP, ≤ 25 MB
- Filter must be one of the supported preset names
- Uploads are rejected when the album or per-person limit is reached, with a clear error showing remaining count
- Guest tokens must not be expired and only grant access to their own group
- Location (EXIF GPS) data is removed from photos on upload
- Plan must be a valid tier; payments are handled by the payment provider, card data is never stored

## Non-Functional
- Response time < 200ms (p95) for reads; upload acknowledged < 500ms, processing done in the background
- JWT authentication for members, owners and admins; scoped, time-limited tokens for guests
- Role-based access: owner, member, guest, admin
- Rate limits: 100 requests/min per user, 30 uploads/min per user or guest, 10 guest joins/min per IP
- Scale to 50K concurrent users, including upload spikes during live events
- Real-time album updates pushed to clients (WebSocket)
- HTTPS only; GDPR compliance (data export and deletion); PCI-DSS through the payment provider
- Resumable uploads with automatic retry after a dropped connection
- Versioned REST API (/api/v1) with consistent JSON error responses
