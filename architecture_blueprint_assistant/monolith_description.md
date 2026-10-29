# Monolithic Architecture

- **Frontend App**: Mobile/web interface for browsing albums and uploading photos, in dark mode by default. On launch it asks for the user's live event and opens straight into that album, ready to upload.  
- **Backend Monolith**: Single deployable app that hosts all modules and exposes the API.  
- **Authentication Module**: Manages member login, sessions and guest invite-link access.  
- **Group, Event & Album Module**: Creates groups, events and albums, handles invites, finds the event that is live for a user from its start and end times, and enforces group size, album size and per-person photo limits.  
- **Photo Upload & Editing Module**: Receives uploads, applies quick filters and generates thumbnails.  
- **Subscription & Billing Module**: Manages free and paid tiers and processes payments through a payment provider.  
- **Database**: Stores users, groups, events, albums, photo metadata and plans centrally.  
- **Photo Storage**: Object storage with a CDN for the image files.  
- **Notification Service**: Sends push and email alerts for invites, event start, new photos and plan limits.
