# Architecture Blueprint - SnapCircle

## Overview
SnapCircle is a collaborative event photo album. A creator sets up a group for an event such as a wedding, birthday or trip, and everyone linked to that group can add their photos to one shared album. People can join with a full account or as a guest through an invite link or QR code, so nobody has to sign up just to share a few pictures. While uploading, users can apply quick filters, crop and rotate photos, and the album updates in real time as new photos arrive.

The app follows a freemium model where only the group creator pays. The free tier allows a set number of photos per album, and paid tiers raise the group size and album size. Creators control the maximum group size, the album photo limit and how many photos each person can upload, and can easily invite more people or upgrade when the group reaches its limit.

Key goals and constraints:
- Scale to 50K concurrent users, including upload spikes during live events
- GDPR compliance, and PCI-DSS compliance through a third-party payment provider
- Mobile-first design across iOS, Android and the web

Full concept: [app_concept.md](./app_concept.md)

## Monolithic vs Microservices
Two designs were drawn for the same application:
- **Monolith** ([diagram](./monolith_architecture.mmd), [description](./monolith_description.md)): one backend containing Authentication, Group & Album, Photo Upload & Editing, and Subscription & Billing modules, backed by a single database, photo storage and a notification service.
- **Microservices** ([diagram](./microservices_architecture.mmd), [description](./microservices_description.md)): an API Gateway in front of independent Auth, Group, Album, Photo Upload, Image Processing, Billing, Notification and Analytics services, each with its own database.

The monolith is stronger on maintainability for a small team, DevOps simplicity, everyday performance and cost. Microservices are stronger on scalability, fault tolerance and independent deployment. SnapCircle's load is uneven, with most traffic coming from uploads during events, so being able to scale Photo Upload and Image Processing on their own is the main argument for microservices.

The recommendation is to **start with a modular monolith** whose modules match the microservices boundaries, then extract Image Processing first once upload volume demands it. This keeps launch costs low for the free tier and keeps plan limits consistent in one database, while leaving a clear migration path. Full analysis: [comparison](./architecture_comparison.md).

## Data Model
The data model defines eight entities: [data_model.mmd](./data_model.mmd), with field details in [data_model.md](./data_model.md).
- **User** creates **Groups** and joins them through **Membership**
- **Guest** gives time-limited access to one group without an account
- **Album** belongs to a group and holds the album and per-person photo limits
- **Photo** belongs to an album and is uploaded by either a user or a guest
- **Subscription** holds each group's plan and limits, and **Payment** records every charge

## Lessons Learned
AI was useful for turning a rough idea into structured documents quickly. From a short description, it produced a concept, two architecture diagrams, a comparison and a data model that all stay consistent with each other, using the same component names and the same limits throughout.

AI output still needed human direction at each step:
- **Formatting:** the first concept was longer than the required template, and had to be cut back to match it exactly.
- **Validation:** a Mermaid file was reported as invalid during review even though it contained only Mermaid syntax, so diagrams need to be checked against the actual files and rendered, not assumed correct.
- **Scope:** requirements like monetization and per-person photo limits only appeared once they were asked for, and then had to be carried through every later document.
- **Judgment:** AI can lay out the trade-offs, but choosing the architecture depends on team size, budget and business stage, which the developer must confirm.

AI works best as a fast first-draft partner, with the developer reviewing, correcting and owning the final design.
