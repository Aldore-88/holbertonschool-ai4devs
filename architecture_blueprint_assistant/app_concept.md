# Application Concept – SnapCircle

## Application
Collaborative event photo album where groups pool their photos into one shared space, with members joining by account or as guests.

## Core Features
- Group creation with shareable invite links and QR codes per event
- Shared event albums that members and guests can upload to
- Guest access without sign-up (name + invite link, time-limited)
- Quick in-upload editing: filters, crop, rotate, brightness/contrast
- Bulk upload from camera roll with background, resumable uploads
- Real-time album feed showing new photos as they arrive
- Reactions and comments on photos
- Download individual photos or the full album as a ZIP
- Album privacy controls (private, invite-only, view-only link)

## Users
- Group Owners: create groups and events, manage invites, moderate content
- Members: registered users who upload, edit, react and keep albums in their history
- Guests: join by invite link to upload and view one event without an account
- Admins: oversee the platform, handle reports and abuse, manage storage policies

## Constraints
- Scale to 50K concurrent users, with upload spikes during live events
- Store and serve millions of images through object storage and a CDN
- GDPR compliance: consent, right to erasure, data export, EU data residency option
- Strip EXIF location data by default to protect privacy
- Content moderation for reported or inappropriate images
- Mobile-first design (iOS, Android, responsive web), with guests able to join from a mobile browser
- Uploads must work on weak event Wi-Fi (retry and offline queue)
