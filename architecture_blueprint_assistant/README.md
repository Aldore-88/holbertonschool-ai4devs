# Architecture Blueprint - SnapCircle

## Overview
SnapCircle is a collaborative event photo album. A creator sets up a group for an event such as a wedding, birthday or trip, and everyone linked to that group can add their photos to one shared album. People can join with a full account or as a guest through an invite link or QR code, so nobody has to sign up just to share a few pictures. Each album is linked to an event with start and end times, so opening the app during the event takes users straight into its album, ready to add photos without interrupting the moment. While uploading, users can apply quick filters, crop and rotate photos, and the album updates in real time as new photos arrive. The app uses dark mode by default.

The app follows a freemium model where only the group creator pays. The free tier allows a set number of photos per album, and paid tiers raise the group size and album size. Creators control the maximum group size, the album photo limit and how many photos each person can upload, and can easily invite more people or upgrade when the group reaches its limit.

Key goals and constraints:
- Scale to 50K concurrent users, including upload spikes during live events
- GDPR compliance, and PCI-DSS compliance through a third-party payment provider
- Mobile-first design across iOS, Android and the web

Full concept: [app_concept.md](./app_concept.md)

## Monolithic vs Microservices
Two designs were drawn for the same application:
- **Monolith** ([diagram](./monolith_architecture.mmd), [description](./monolith_description.md)): one backend containing Authentication, Group, Event & Album, Photo Upload & Editing, and Subscription & Billing modules, backed by a single database, photo storage and a notification service.
- **Microservices** ([diagram](./microservices_architecture.mmd), [description](./microservices_description.md)): an API Gateway in front of independent Auth, Group, Event, Album, Photo Upload, Image Processing, Billing, Notification and Analytics services, each with its own database.

The monolith is stronger on maintainability for a small team, DevOps simplicity, everyday performance and cost. Microservices are stronger on scalability, fault tolerance and independent deployment. SnapCircle's load is uneven, with most traffic coming from uploads during events, so being able to scale Photo Upload and Image Processing on their own is the main argument for microservices.

The recommendation is to **start with a modular monolith** whose modules match the microservices boundaries, then extract Image Processing first once upload volume demands it. This keeps launch costs low for the free tier and keeps plan limits consistent in one database, while leaving a clear migration path. Full analysis: [comparison](./architecture_comparison.md).

## Data Model
The data model defines nine entities: [data_model.mmd](./data_model.mmd), with field details in [data_model.md](./data_model.md).
- **User** creates **Groups** and joins them through **Membership**, and stores a theme preference (dark by default)
- **Guest** gives time-limited access to one group without an account
- **Event** belongs to a group and holds the start and end times used to open the live album on launch
- **Album** belongs to one event and holds the album and per-person photo limits
- **Photo** belongs to an album and is uploaded by either a user or a guest
- **Subscription** holds each group's plan and limits, and **Payment** records every charge

## Other Ideas to Expand On
- **Upload from the browser:** guests scan a QR code and upload without installing an app or creating an account. This matters most, because it's the top complaint.
- **Reliable uploads:** use a queue that resumes after a dropped connection, retries automatically and shows progress. Support iPhone photo formats (HEIC and Live Photos), not just Android.
- **Original quality:** keep the original files, with a toggle for full resolution.
- **One-tap download:** let people download the whole album as a ZIP file in one tap.
- **Duplicates and moderation:** spot duplicates automatically, and give the host simple moderation tools.
- **Album open window:** let the album stay open before and after the event, and show clearly when it closes.
- **Privacy controls:** let hosts turn off or reset the invite link, and remove location data from photos.
- **Visible limits:** show per-person and album limits on screen (e.g. "3 of 10 left") rather than failing without a message.

## Lessons Learned
AI was useful for turning a rough idea into structured documents quickly. From a short description, it produced a concept, two architecture diagrams, a comparison and a data model that all stay consistent with each other, using the same component names and the same limits throughout.

AI output still needed human direction at each step:
- **Formatting:** the first concept was longer than the required template, and had to be cut back to match it exactly.
- **Validation:** a Mermaid file was reported as invalid during review even though it contained only Mermaid syntax, so diagrams need to be checked against the actual files and rendered, not assumed correct.
- **Scope:** requirements like monetization, per-person photo limits, scheduled events and dark mode only appeared once they were asked for, and then had to be carried through every later document.
- **Judgment:** AI can lay out the trade-offs, but choosing the architecture depends on team size, budget and business stage, which the developer must confirm.

AI works best as a fast first-draft partner, with the developer reviewing, correcting and owning the final design.
