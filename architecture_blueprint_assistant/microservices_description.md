# Microservices Architecture

- **API Gateway**: Single entry point that routes requests and validates tokens with the Auth Service.  
- **Auth Service**: Manages member login, sessions and guest invite-link tokens.  
- **Group Service**: Manages groups, members and invites, and checks the Billing Service for the group size allowed by the plan.  
- **Album Service**: Manages albums and enforces album size and per-person photo limits from the Group Service; tells the Notification Service about new photos.  
- **Photo Upload Service**: Accepts uploads, checks limits with the Album Service and passes images to the Image Processing Service.  
- **Image Processing Service**: Applies quick filters, creates thumbnails, strips location data and saves files to Photo Storage.  
- **Billing Service**: Handles free and paid tiers and payments, and tells the Notification Service about upgrades and renewals.  
- **Notification Service**: Sends push and email alerts for invites, new photos and plan limits.  
- **Analytics Service**: Collects usage metrics such as uploads, active groups and upgrades.  
- **Photo Storage**: Object storage with a CDN for the image files.  
- **Database per Service**: Each service owns its own data store.
