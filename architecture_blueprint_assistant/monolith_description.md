# Monolithic Architecture

- **Frontend App**: Mobile/web interface for browsing albums and uploading photos.  
- **Backend Monolith**: Single deployable app that hosts all modules and exposes the API.  
- **Authentication Module**: Manages member login, sessions and guest invite-link access.  
- **Group & Album Module**: Creates groups and albums, handles invites and enforces group size, album size and per-person photo limits.  
- **Photo Upload & Editing Module**: Receives uploads, applies quick filters and generates thumbnails.  
- **Subscription & Billing Module**: Manages free and paid tiers and processes payments through a payment provider.  
- **Database**: Stores users, groups, albums, photo metadata and plans centrally.  
- **Photo Storage**: Object storage with a CDN for the image files.  
- **Notification Service**: Sends push and email alerts for invites, new photos and plan limits.
