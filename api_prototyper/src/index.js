const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const USER_TOKEN_TTL = DAY / 1000; // seconds
const PROCESSING_DELAY = 1000; // simulated background processing time in ms

const PLANS = {
  free: { member_limit: 20, photo_limit: 100 },
  plus: { member_limit: 100, photo_limit: 1000 },
  pro: { member_limit: 500, photo_limit: 10000 },
};
const FILTERS = ['none', 'vivid', 'warm', 'cool', 'mono', 'vintage'];
const ROTATIONS = [0, 90, 180, 270];
const PRIVACY = ['group', 'link'];
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// In-memory store: this is a prototype, so all data is lost on restart
const db = {
  users: new Map(),
  groups: new Map(),
  memberships: [],
  guests: new Map(),
  events: new Map(),
  albums: new Map(),
  photos: new Map(),
  files: new Map(),
};

const timestamp = () => new Date().toISOString();

// ---------- Errors ----------

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (details, message = 'Request is invalid') =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);
const unauthorized = (message = 'Token is missing or expired') =>
  new ApiError(401, 'UNAUTHORIZED', message);
const forbidden = (message) => new ApiError(403, 'FORBIDDEN', message);
const notFound = (what) => new ApiError(404, 'NOT_FOUND', `${what} not found`);
const conflict = (message) => new ApiError(409, 'CONFLICT', message);
const limitReached = (message) => new ApiError(422, 'LIMIT_REACHED', message);

// ---------- Validation ----------

const text = (min, max) => (v) =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max
    ? null
    : `must be text of ${min}-${max} characters`;
const integer = (min) => (v) =>
  Number.isInteger(v) && v >= min ? null : `must be an integer of at least ${min}`;
const oneOf = (values) => (v) =>
  values.includes(v) ? null : `must be one of: ${values.join(', ')}`;
const email = (v) =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254
    ? null
    : 'must be a valid email address';
const password = (v) =>
  typeof v === 'string' && v.length >= 8 && v.length <= 128 ? null : 'must be 8-128 characters';
const nonEmpty = (v) => (typeof v === 'string' && v.length > 0 ? null : 'is required');
const dateTime = (v) =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v) &&
  !Number.isNaN(Date.parse(v))
    ? null
    : 'must be an ISO 8601 date-time with an offset, e.g. 2026-12-31T18:00:00Z';
const timeZone = (v) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: v });
    return typeof v === 'string' ? null : 'must be an IANA time zone';
  } catch {
    return 'must be a valid IANA time zone, e.g. Australia/Sydney';
  }
};
const crop = (v) => {
  const inRange = (n) => typeof n === 'number' && n >= 0 && n <= 1;
  const ok =
    v && typeof v === 'object' &&
    [v.x, v.y, v.width, v.height].every(inRange) &&
    v.width > 0 && v.height > 0 && v.x + v.width <= 1 && v.y + v.height <= 1;
  return ok ? null : 'must be { x, y, width, height } as fractions from 0 to 1 inside the image';
};

// Checks body against field rules and returns only the known fields.
// Every problem is reported at once; with partial (PATCH) required fields may be left out.
function validate(body = {}, rules, { partial = false } = {}) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw badRequest([{ field: 'body', issue: 'must be a JSON object' }]);
  }
  const values = {};
  const details = [];
  for (const [field, { required, check }] of Object.entries(rules)) {
    const value = body[field];
    if (value === undefined || value === null) {
      if (required && !partial) details.push({ field, issue: 'is required' });
      continue;
    }
    const issue = check(value);
    if (issue) details.push({ field, issue });
    else values[field] = value;
  }
  if (details.length) throw badRequest(details);
  return values;
}

const groupRules = {
  name: { required: true, check: text(1, 100) },
  max_members: { check: integer(1) },
};
const eventRules = {
  name: { required: true, check: text(1, 100) },
  starts_at: { required: true, check: dateTime },
  ends_at: { required: true, check: dateTime },
  timezone: { required: true, check: timeZone },
  location: { check: text(1, 200) },
};
const albumRules = {
  title: { required: true, check: text(1, 100) },
  max_photos: { required: true, check: integer(1) },
  max_photos_per_person: { required: true, check: integer(1) },
  privacy: { check: oneOf(PRIVACY) },
};
const photoEditRules = {
  filter: { check: oneOf(FILTERS) },
  rotation: { check: oneOf(ROTATIONS) },
  crop: { check: crop },
};

function paginate(items, query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  const details = [];
  if (!Number.isInteger(page) || page < 1) {
    details.push({ field: 'page', issue: 'must be an integer of at least 1' });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    details.push({ field: 'limit', issue: 'must be an integer from 1 to 100' });
  }
  if (details.length) throw badRequest(details, 'Query parameters are invalid');
  return {
    data: items.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total_items: items.length, total_pages: Math.ceil(items.length / limit) },
  };
}

// ---------- Auth and rate limiting ----------

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(plain, salt, 64).toString('hex')}`;
}

function verifyPassword(plain, stored) {
  const [salt, hash] = stored.split(':');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), crypto.scryptSync(plain, salt, 64));
}

function issueToken(claims, expiresIn) {
  return {
    access_token: jwt.sign(claims, JWT_SECRET, { expiresIn }),
    token_type: 'Bearer',
    expires_in: expiresIn,
    role: claims.role,
  };
}

function authenticate(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  let claims = null;
  try {
    if (scheme === 'Bearer') claims = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    claims = null;
  }
  // Tokens outlive the in-memory store, so make sure the user or guest still exists
  const known = claims && (claims.role === 'guest' ? db.guests.has(claims.sub) : db.users.has(claims.sub));
  if (!known) throw unauthorized();
  req.auth = claims;
  next();
}

// Fixed-window limiter kept in memory, keyed per caller
function rateLimit(max, windowMs, keyOf) {
  const windows = new Map();
  return (req, res, next) => {
    const key = keyOf(req);
    const now = Date.now();
    let window = windows.get(key);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + windowMs };
      windows.set(key, window);
    }
    window.count += 1;
    if (window.count > max) {
      res.set('Retry-After', String(Math.ceil((window.resetAt - now) / 1000)));
      throw new ApiError(429, 'RATE_LIMITED', 'Too many requests, try again later');
    }
    next();
  };
}

const byIp = (req) => req.ip;
const byCaller = (req) => req.auth.sub;

// ---------- Access helpers ----------

// The caller's role in a group: owner, member, guest, admin, or null
function roleIn(auth, groupId) {
  if (auth.role === 'guest') return auth.group_id === groupId ? 'guest' : null;
  const membership = db.memberships.find((m) => m.group_id === groupId && m.user_id === auth.sub);
  if (membership) return membership.role;
  return auth.role === 'admin' ? 'admin' : null;
}

const belongsTo = (auth, groupId) => !['admin', null].includes(roleIn(auth, groupId));

// Owner-only actions are also allowed for admins
function loadGroup(req, groupId, { ownerOnly = false } = {}) {
  const group = db.groups.get(groupId);
  if (!group) throw notFound('Group');
  const role = roleIn(req.auth, group.id);
  if (!role) throw forbidden('You are not a member of this group');
  if (ownerOnly && role !== 'owner' && role !== 'admin') {
    throw forbidden('Only the group owner can do this');
  }
  return { group, role };
}

function loadEvent(req, eventId, options) {
  const event = db.events.get(eventId);
  if (!event) throw notFound('Event');
  return { event, ...loadGroup(req, event.group_id, options) };
}

function loadAlbum(req, albumId, options) {
  const album = db.albums.get(albumId);
  if (!album) throw notFound('Album');
  return { album, ...loadEvent(req, album.event_id, options) };
}

function loadPhoto(req, photoId, options) {
  const photo = db.photos.get(photoId);
  if (!photo) throw notFound('Photo');
  return { photo, ...loadAlbum(req, photo.album_id, options) };
}

const isUploader = (photo, auth) =>
  auth.role === 'guest' ? photo.uploader_guest_id === auth.sub : photo.uploader_user_id === auth.sub;

// ---------- Domain helpers ----------

// Counts members plus guests whose access has not expired
function memberCount(groupId) {
  const members = db.memberships.filter((m) => m.group_id === groupId).length;
  const guests = [...db.guests.values()].filter(
    (g) => g.group_id === groupId && Date.parse(g.expires_at) > Date.now(),
  ).length;
  return members + guests;
}

function assertRoomInGroup(group) {
  if (memberCount(group.id) >= group.max_members) {
    throw limitReached(`This group is full (${group.max_members} of ${group.max_members} members)`);
  }
}

function assertMemberPlan(group) {
  const { member_limit } = PLANS[group.plan];
  if (group.max_members > member_limit) {
    throw limitReached(`The ${group.plan} plan allows up to ${member_limit} members, upgrade to add more`);
  }
}

function newInviteCode() {
  let code;
  do code = crypto.randomBytes(6).toString('base64url');
  while ([...db.groups.values()].some((g) => g.invite_code === code));
  return code;
}

const findGroupByInvite = (code) => [...db.groups.values()].find((g) => g.invite_code === code);

// Guests keep access until a day after the group's last event ends, and at least a day
function guestExpiry(groupId) {
  const lastEnd = Math.max(
    0,
    ...[...db.events.values()].filter((e) => e.group_id === groupId).map((e) => Date.parse(e.ends_at)),
  );
  return Math.max(Date.now(), lastEnd) + DAY;
}

function buildEvent(base, body) {
  const event = { ...base, ...body };
  if (body.name) event.name = body.name.trim();
  if (body.location) event.location = body.location.trim();
  event.starts_at = new Date(event.starts_at).toISOString();
  event.ends_at = new Date(event.ends_at).toISOString();
  if (Date.parse(event.ends_at) <= Date.parse(event.starts_at)) {
    throw badRequest([{ field: 'ends_at', issue: 'must be after starts_at' }]);
  }
  return event;
}

function buildAlbum(base, body, group) {
  const album = { ...base, ...body };
  if (body.title) album.title = body.title.trim();
  if (album.max_photos_per_person > album.max_photos) {
    throw badRequest([{ field: 'max_photos_per_person', issue: 'must be less than or equal to max_photos' }]);
  }
  const { photo_limit } = PLANS[group.plan];
  if (album.max_photos > photo_limit) {
    throw limitReached(`The ${group.plan} plan allows up to ${photo_limit} photos per album, upgrade for more`);
  }
  return album;
}

const photosIn = (albumId) => [...db.photos.values()].filter((p) => p.album_id === albumId);

// Multipart fields arrive as strings, so convert them before validating
function parseEditFields(fields) {
  const edits = {};
  if (fields.filter !== undefined) edits.filter = fields.filter;
  if (fields.rotation !== undefined) edits.rotation = Number(fields.rotation);
  if (fields.crop !== undefined) {
    try {
      edits.crop = JSON.parse(fields.crop);
    } catch {
      edits.crop = fields.crop;
    }
  }
  return edits;
}

function applyEdits(photo, edits) {
  if (edits.filter) photo.filter = edits.filter;
  if (edits.rotation !== undefined) photo.rotation = edits.rotation;
  if (edits.crop) {
    const { x, y, width, height } = edits.crop;
    photo.crop = { x, y, width, height };
  }
}

function deletePhoto(photoId) {
  db.photos.delete(photoId);
  db.files.delete(photoId);
}

function deleteAlbum(albumId) {
  for (const photo of photosIn(albumId)) deletePhoto(photo.id);
  db.albums.delete(albumId);
}

function deleteEvent(event) {
  if (event.album_id) deleteAlbum(event.album_id);
  db.events.delete(event.id);
}

function deleteGroup(groupId) {
  for (const event of [...db.events.values()]) {
    if (event.group_id === groupId) deleteEvent(event);
  }
  for (const guest of [...db.guests.values()]) {
    if (guest.group_id === groupId) db.guests.delete(guest.id);
  }
  db.memberships = db.memberships.filter((m) => m.group_id !== groupId);
  db.groups.delete(groupId);
}

// ---------- Response shapes ----------

function groupView(group, role) {
  const { id, creator_id, name, max_members, plan, created_at } = group;
  const view = { id, creator_id, name, max_members, member_count: memberCount(id), plan, created_at };
  if (role === 'owner' || role === 'admin') view.invite_code = group.invite_code;
  return view;
}

const inviteView = (group) => ({
  invite_code: group.invite_code,
  invite_url: `${APP_URL}/join/${group.invite_code}`,
});

function albumView(album, auth) {
  const photos = photosIn(album.id);
  const mine = photos.filter((p) => isUploader(p, auth)).length;
  const remaining = Math.min(album.max_photos_per_person - mine, album.max_photos - photos.length);
  return { ...album, photo_count: photos.length, my_remaining_photos: Math.max(0, remaining) };
}

// ---------- App ----------

const app = express();
app.disable('x-powered-by');
app.use(express.json());

const api = express.Router();
app.use('/api/v1', api);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) =>
    MIME_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(badRequest([{ field: 'file', issue: 'must be a JPEG, PNG, HEIC or WebP image' }])),
});

// Auth (no token needed)

api.post('/auth/register', rateLimit(10, MINUTE, byIp), (req, res) => {
  const body = validate(req.body, {
    name: { required: true, check: text(1, 100) },
    email: { required: true, check: email },
    password: { required: true, check: password },
  });
  const address = body.email.toLowerCase();
  if ([...db.users.values()].some((u) => u.email === address)) {
    throw conflict('Email is already registered');
  }
  const user = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    email: address,
    password_hash: hashPassword(body.password),
    role: address === ADMIN_EMAIL ? 'admin' : 'member',
    theme: 'dark',
    created_at: timestamp(),
  };
  db.users.set(user.id, user);
  res.status(201).json(issueToken({ sub: user.id, role: user.role }, USER_TOKEN_TTL));
});

api.post('/auth/login', rateLimit(10, MINUTE, byIp), (req, res) => {
  const body = validate(req.body, {
    email: { required: true, check: email },
    password: { required: true, check: nonEmpty },
  });
  const user = [...db.users.values()].find((u) => u.email === body.email.toLowerCase());
  if (!user || !verifyPassword(body.password, user.password_hash)) {
    throw unauthorized('Email or password is incorrect');
  }
  res.json(issueToken({ sub: user.id, role: user.role }, USER_TOKEN_TTL));
});

api.post('/auth/guest', rateLimit(10, MINUTE, byIp), (req, res) => {
  const body = validate(req.body, {
    invite_code: { required: true, check: text(1, 64) },
    display_name: { required: true, check: text(1, 50) },
  });
  const group = findGroupByInvite(body.invite_code);
  if (!group) throw notFound('Invite code');
  assertRoomInGroup(group);
  const expiresAt = guestExpiry(group.id);
  const guest = {
    id: crypto.randomUUID(),
    group_id: group.id,
    display_name: body.display_name.trim(),
    expires_at: new Date(expiresAt).toISOString(),
  };
  db.guests.set(guest.id, guest);
  const expiresIn = Math.ceil((expiresAt - Date.now()) / 1000);
  res.status(201).json(issueToken({ sub: guest.id, role: 'guest', group_id: group.id }, expiresIn));
});

// Everything below needs a valid JWT
api.use(authenticate, rateLimit(100, MINUTE, byCaller));

// Groups

api.get('/groups', (req, res) => {
  const groups = [...db.groups.values()]
    .filter((group) => belongsTo(req.auth, group.id))
    .reverse()
    .map((group) => groupView(group, roleIn(req.auth, group.id)));
  res.json(paginate(groups, req.query));
});

api.post('/groups', (req, res) => {
  if (req.auth.role === 'guest') throw forbidden('Create an account to start a group');
  const body = validate(req.body, groupRules);
  const group = {
    id: crypto.randomUUID(),
    creator_id: req.auth.sub,
    name: body.name.trim(),
    max_members: body.max_members ?? PLANS.free.member_limit,
    invite_code: newInviteCode(),
    plan: 'free',
    created_at: timestamp(),
  };
  assertMemberPlan(group);
  db.groups.set(group.id, group);
  db.memberships.push({
    id: crypto.randomUUID(),
    group_id: group.id,
    user_id: req.auth.sub,
    role: 'owner',
    joined_at: timestamp(),
  });
  res.status(201).json(groupView(group, 'owner'));
});

api.post('/groups/join', (req, res) => {
  if (req.auth.role === 'guest') throw forbidden('Guests join through /auth/guest');
  const body = validate(req.body, { invite_code: { required: true, check: text(1, 64) } });
  const group = findGroupByInvite(body.invite_code);
  if (!group) throw notFound('Invite code');
  if (!belongsTo(req.auth, group.id)) {
    assertRoomInGroup(group);
    db.memberships.push({
      id: crypto.randomUUID(),
      group_id: group.id,
      user_id: req.auth.sub,
      role: 'member',
      joined_at: timestamp(),
    });
  }
  res.json(groupView(group, roleIn(req.auth, group.id)));
});

api.get('/groups/:groupId', (req, res) => {
  const { group, role } = loadGroup(req, req.params.groupId);
  res.json(groupView(group, role));
});

api.patch('/groups/:groupId', (req, res) => {
  const { group, role } = loadGroup(req, req.params.groupId, { ownerOnly: true });
  const body = validate(req.body, groupRules, { partial: true });
  const updated = { ...group, ...body };
  if (body.name) updated.name = body.name.trim();
  assertMemberPlan(updated);
  Object.assign(group, updated);
  res.json(groupView(group, role));
});

api.delete('/groups/:groupId', (req, res) => {
  const { group } = loadGroup(req, req.params.groupId, { ownerOnly: true });
  deleteGroup(group.id);
  res.status(204).end();
});

api.post('/groups/:groupId/invite-code', (req, res) => {
  const { group } = loadGroup(req, req.params.groupId, { ownerOnly: true });
  group.invite_code = newInviteCode();
  res.json(inviteView(group));
});

api.delete('/groups/:groupId/invite-code', (req, res) => {
  const { group } = loadGroup(req, req.params.groupId, { ownerOnly: true });
  group.invite_code = null;
  res.status(204).end();
});

// Events

api.get('/groups/:groupId/events', (req, res) => {
  const { group } = loadGroup(req, req.params.groupId);
  const events = [...db.events.values()]
    .filter((e) => e.group_id === group.id)
    .sort((a, b) => Date.parse(b.starts_at) - Date.parse(a.starts_at));
  res.json(paginate(events, req.query));
});

api.post('/groups/:groupId/events', (req, res) => {
  const { group } = loadGroup(req, req.params.groupId, { ownerOnly: true });
  const body = validate(req.body, eventRules);
  const event = buildEvent(
    { id: crypto.randomUUID(), group_id: group.id, location: null, album_id: null },
    body,
  );
  db.events.set(event.id, event);
  res.status(201).json(event);
});

// Registered before /events/:eventId so "live" is not read as an ID
api.get('/events/live', (req, res) => {
  const now = Date.now();
  const [live] = [...db.events.values()]
    .filter((e) => belongsTo(req.auth, e.group_id))
    .filter((e) => Date.parse(e.starts_at) <= now && now <= Date.parse(e.ends_at))
    .sort((a, b) => Date.parse(b.starts_at) - Date.parse(a.starts_at));
  if (!live) return res.status(204).end();
  res.json(live);
});

api.get('/events/:eventId', (req, res) => {
  const { event } = loadEvent(req, req.params.eventId);
  res.json(event);
});

api.patch('/events/:eventId', (req, res) => {
  const { event } = loadEvent(req, req.params.eventId, { ownerOnly: true });
  const body = validate(req.body, eventRules, { partial: true });
  Object.assign(event, buildEvent(event, body));
  res.json(event);
});

api.delete('/events/:eventId', (req, res) => {
  const { event } = loadEvent(req, req.params.eventId, { ownerOnly: true });
  deleteEvent(event);
  res.status(204).end();
});

// Albums

api.post('/events/:eventId/album', (req, res) => {
  const { event, group } = loadEvent(req, req.params.eventId, { ownerOnly: true });
  if (event.album_id) throw conflict('This event already has an album');
  const body = validate(req.body, albumRules);
  const album = buildAlbum({ id: crypto.randomUUID(), event_id: event.id, privacy: 'group' }, body, group);
  db.albums.set(album.id, album);
  event.album_id = album.id;
  res.status(201).json(albumView(album, req.auth));
});

api.get('/albums/:albumId', (req, res) => {
  const { album } = loadAlbum(req, req.params.albumId);
  res.json(albumView(album, req.auth));
});

api.patch('/albums/:albumId', (req, res) => {
  const { album, group } = loadAlbum(req, req.params.albumId, { ownerOnly: true });
  const body = validate(req.body, albumRules, { partial: true });
  Object.assign(album, buildAlbum(album, body, group));
  res.json(albumView(album, req.auth));
});

// Photos

api.get('/albums/:albumId/photos', (req, res) => {
  const { album } = loadAlbum(req, req.params.albumId);
  res.json(paginate(photosIn(album.id).reverse(), req.query));
});

api.post(
  '/albums/:albumId/photos',
  rateLimit(30, MINUTE, byCaller),
  // Check access before reading the file into memory
  (req, res, next) => {
    req.target = loadAlbum(req, req.params.albumId);
    next();
  },
  upload.single('file'),
  (req, res) => {
    const { album } = req.target;
    if (!req.file) throw badRequest([{ field: 'file', issue: 'is required' }]);
    const edits = validate(parseEditFields(req.body), photoEditRules);

    const photos = photosIn(album.id);
    if (photos.length >= album.max_photos) {
      throw limitReached(`This album is full (${photos.length} of ${album.max_photos} photos)`);
    }
    const mine = photos.filter((p) => isUploader(p, req.auth)).length;
    if (mine >= album.max_photos_per_person) {
      throw limitReached(`You have used ${mine} of ${album.max_photos_per_person} photos for this album`);
    }

    const isGuest = req.auth.role === 'guest';
    const id = crypto.randomUUID();
    const photo = {
      id,
      album_id: album.id,
      uploader_user_id: isGuest ? null : req.auth.sub,
      uploader_guest_id: isGuest ? req.auth.sub : null,
      storage_url: `${req.protocol}://${req.get('host')}/api/v1/photos/${id}/file`,
      filter: 'none',
      rotation: 0,
      crop: null,
      status: 'processing',
      uploaded_at: timestamp(),
    };
    applyEdits(photo, edits);
    db.photos.set(id, photo);
    db.files.set(id, { buffer: req.file.buffer, mime_type: req.file.mimetype });

    // Stand-in for the background image processing worker
    setTimeout(() => {
      photo.status = 'ready';
    }, PROCESSING_DELAY).unref();

    res.status(202).json(photo);
  },
);

api.get('/photos/:photoId', (req, res) => {
  const { photo } = loadPhoto(req, req.params.photoId);
  res.json(photo);
});

api.get('/photos/:photoId/file', (req, res) => {
  const { photo } = loadPhoto(req, req.params.photoId);
  const file = db.files.get(photo.id);
  res.type(file.mime_type).send(file.buffer);
});

api.patch('/photos/:photoId', (req, res) => {
  const { photo } = loadPhoto(req, req.params.photoId);
  if (!isUploader(photo, req.auth)) {
    throw forbidden('Only the person who uploaded this photo can edit it');
  }
  applyEdits(photo, validate(req.body, photoEditRules));
  res.json(photo);
});

api.delete('/photos/:photoId', (req, res) => {
  const { photo, role } = loadPhoto(req, req.params.photoId);
  if (!isUploader(photo, req.auth) && role !== 'owner' && role !== 'admin') {
    throw forbidden('Only the uploader, the group owner or an admin can delete this photo');
  }
  deletePhoto(photo.id);
  res.status(204).end();
});

// ---------- Error handling ----------

app.use((req, res, next) => next(notFound('Route')));

// Turns every error into the { error: { code, message, details } } shape from the spec
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    err = err.code === 'LIMIT_FILE_SIZE'
      ? new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Photo must be 25 MB or smaller')
      : badRequest([{ field: err.field || 'file', issue: err.message }]);
  } else if (err.type === 'entity.parse.failed') {
    err = badRequest([{ field: 'body', issue: 'must be valid JSON' }]);
  } else if (err.type === 'entity.too.large') {
    err = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  } else if (!(err instanceof ApiError)) {
    console.error(err);
    err = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong');
  }
  const error = { code: err.code, message: err.message };
  if (err.details) error.details = err.details;
  res.status(err.status).json({ error });
});

if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set, using an insecure development secret');
  }
  app.listen(PORT, () => console.log(`SnapCircle API running on http://localhost:${PORT}/api/v1`));
}

module.exports = app;
