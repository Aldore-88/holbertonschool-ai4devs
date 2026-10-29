# Data Model

- **User**: id, name, email, password_hash, role, created_at  
- **Group**: id, creator_id, name, max_members, invite_code, created_at  
- **Membership**: id, group_id, user_id, role, joined_at  
- **Guest**: id, group_id, display_name, access_token, expires_at  
- **Album**: id, group_id, title, event_date, max_photos, max_photos_per_person, privacy  
- **Photo**: id, album_id, uploader_user_id, uploader_guest_id, storage_url, filter, uploaded_at  
- **Subscription**: id, group_id, plan, member_limit, photo_limit, status, renews_at  
- **Payment**: id, subscription_id, amount, currency, provider_ref, status, paid_at
