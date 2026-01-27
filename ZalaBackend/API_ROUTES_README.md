# Zala API Route Reference

This document summarizes the REST endpoints exposed by the FastAPI service so the UI can wire requests without digging through the backend.

- **Base URL**: all application routes sit under the `/api` prefix unless noted.
- **Authentication**: no tokens yet; just supply the JSON payloads described below.
- **Pagination**: collection GETs accept `skip` and `limit` query params (default `0` and `100`).

---

## Root

| Method | Path | Purpose | Notes |
| --- | --- | --- | --- |
| GET | `/` | Health check | Returns `{"message": "Zala API is running"}`; no auth required. |

---

## Authentication (`/api/login`)

| Method | Path | Purpose | Body Fields | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/login/` | Authenticate a user | `username` *(string, required)*, `password` *(string, required)* | `UserPublic` (user details if credentials match) |
| POST | `/api/login/google` | Authenticate via Google OAuth | `code` *(string, preferred)* plus optional `scope`; falls back to `id_token` *(string)* for legacy clients | `UserPublic` (populated from Google profile or linked user, includes `gmail_connected` flag) |

401 is returned when credentials are invalid.

---

## Google Mail (`/api/google-mail`)

| Method | Path | Purpose | Body Fields | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/google-mail/send` | Send a Gmail message using the authenticated user's Google account | `user_id` *(int, required)*, `to` *(email, required)*, `subject` *(string, required)*, `html` *(string, required)*, `from_name` *(string, optional)* | `{ "id": "<gmail_message_id>", "thread_id": "<gmail_thread_id>" }` |

Returns 400 if the user has not completed Google OAuth with Gmail scopes.

---

## Users (`/api/users`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/users/` | Create user | JSON: `username` *(<=15 chars)*, `password`, optional `profile_pic`, `role` | `UserPublic` |
| GET | `/api/users/` | List users | Query: `skip`, `limit` | `List[UserPublic]` |
| GET | `/api/users/batch` | Fetch multiple by id | Query: `ids=1&ids=2...` | `List[UserPublic]`; 404 if any id missing |
| GET | `/api/users/{user_id}` | Get single user | Path `user_id` | `UserPublic` (includes contact if linked) |
| PUT | `/api/users/{user_id}` | Update user | JSON: any of `username`, `password`, `profile_pic`, `role` | `UserPublic` |
| DELETE | `/api/users/{user_id}` | Delete user | Path `user_id` | 204 No Content |
| GET | `/api/users/{user_id}/contact` | Fetch linked contact | Path `user_id` | `ContactPublic`; 404 if missing |
| POST | `/api/users/{user_id}/contacts/{contact_id}` | Link existing contact | Path `user_id`, `contact_id` | `UserPublic` |
| DELETE | `/api/users/{user_id}/contacts/{contact_id}` | Unlink contact | Path `user_id`, `contact_id` | `UserPublic` |
| GET | `/api/users/{user_id}/properties` | Properties assigned to user | Path `user_id` | `List[PropertyPublic]` |
| POST | `/api/users/{user_id}/properties/{property_id}` | Assign property | Path `user_id`, `property_id` | `UserPublicWithProperties` |
| DELETE | `/api/users/{user_id}/properties/{property_id}` | Remove property assignment | Path `user_id`, `property_id` | `UserPublicWithProperties` |

**Important validations**
- Username must be unique; duplicate attempts return 400.
- Linking operations fail with 404 when either side is missing.

---

## Contacts (`/api/contacts`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/contacts/` | Create contact | JSON: `first_name` (required), optional `last_name`, `email`, `phone` | `ContactPublic` |
| GET | `/api/contacts/` | List contacts | Query: `skip`, `limit` | `List[ContactPublic]` |
| GET | `/api/contacts/{contact_id}` | Get contact | Path `contact_id` | `ContactPublic` |
| PUT | `/api/contacts/{contact_id}` | Update contact | JSON: any of `first_name`, `last_name`, `email`, `phone` | `ContactPublic` |
| DELETE | `/api/contacts/{contact_id}` | Delete contact | Path `contact_id` | 204 No Content |

---

## Addresses (`/api/addresses`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/addresses/` | Create address | JSON: `street_1`, `city`, `state`, `zipcode`; optional `street_2`, `lat`, `long` | `AddressPublic` |
| GET | `/api/addresses/` | List addresses | Query: `skip`, `limit` | `List[AddressPublic]` |
| GET | `/api/addresses/{address_id}` | Get address | Path `address_id` | `AddressPublic` |
| PUT | `/api/addresses/{address_id}` | Update address | JSON: any address fields | `AddressPublic` |
| DELETE | `/api/addresses/{address_id}` | Delete address | Path `address_id` | 204 No Content |

---

## Properties (nested under address)

Routes are prefixed with `/api/addresses/{address_id}/properties`.

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/addresses/{address_id}/properties/` | Create property for address | JSON: `property_name` (required), optional `mls_number`, `notes`, `image_url` | `PropertyPublic` |
| GET | `/api/addresses/{address_id}/properties/` | List properties for address | Query: `skip`, `limit` | `List[PropertyPublic]` |
| GET | `/api/addresses/{address_id}/properties/{property_id}` | Get property | Path `address_id`, `property_id` | `PropertyPublic` |
| PUT | `/api/addresses/{address_id}/properties/{property_id}` | Update property | JSON: any of `property_name`, `mls_number`, `notes`, `lead_id`, `image_url` | `PropertyPublic` |
| DELETE | `/api/addresses/{address_id}/properties/{property_id}` | Delete property | Path `address_id`, `property_id` | 204 No Content |
| POST | `/api/addresses/{address_id}/properties/{property_id}/image` | Upload/replace property card image | `multipart/form-data` with file field `file` (image only) | `PropertyPublic` |
| DELETE | `/api/addresses/{address_id}/properties/{property_id}/image` | Remove stored property image | Path `address_id`, `property_id` | `PropertyPublic` |

---

## Units (nested under property)

Routes are prefixed with `/api/properties/{property_id}/units`.

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/properties/{property_id}/units/` | Create unit | JSON: any of `apt_num`, `bedrooms`, `bath`, `sqft`, `notes` | `UnitPublic` |
| GET | `/api/properties/{property_id}/units/` | List units | Query: `skip`, `limit` | `List[UnitPublic]` |
| GET | `/api/properties/{property_id}/units/{unit_id}` | Get unit | Path `property_id`, `unit_id` | `UnitPublic` |
| PUT | `/api/properties/{property_id}/units/{unit_id}` | Update unit | JSON: any unit fields | `UnitPublic` |
| DELETE | `/api/properties/{property_id}/units/{unit_id}` | Delete unit | Path IDs | 204 No Content |

---

## Leads (`/api/leads`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/leads/` | Create lead | JSON: optional `person_type`, `business`, `website`, `license_num`, `notes`, `image_url` | `LeadPublic` |
| GET | `/api/leads/` | List leads | Query: `skip`, `limit` | `List[LeadPublic]` (includes nested relationships) |
| GET | `/api/leads/{lead_id}` | Get lead | Path `lead_id` | `LeadPublic` |
| PUT | `/api/leads/{lead_id}` | Update lead | JSON: same fields as create | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}` | Delete lead | Path `lead_id` | 204 No Content |
| POST | `/api/leads/{lead_id}/image` | Upload/replace lead card image | `multipart/form-data` with image file `file` | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/image` | Remove stored lead image | Path `lead_id` | `LeadPublic` |

### Lead Linking Shortcuts

| Method | Path | Purpose | Response |
| --- | --- | --- | --- |
| POST | `/api/leads/{lead_id}/properties/{property_id}` | Attach property to lead | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/properties/{property_id}` | Remove property from lead | `LeadPublic` |
| POST | `/api/leads/{lead_id}/users/{user_id}` | Attach owner/agent | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/users/{user_id}` | Remove owner/agent | `LeadPublic` |
| POST | `/api/leads/{lead_id}/contacts/{contact_id}` | Attach contact | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/contacts/{contact_id}` | Remove contact | `LeadPublic` |
| POST | `/api/leads/{lead_id}/addresses/{address_id}` | Attach address | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/addresses/{address_id}` | Remove address | `LeadPublic` |

All linking endpoints return the refreshed lead payload (same as `GET /api/leads/{lead_id}`) and issue 404 when either side is missing.

---

## Campaigns (`/api/campaigns`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/campaigns/` | Create campaign | JSON: `campaign_name` (required), `user_id` (required), optional `property_id` | `CampaignPublic` |
| GET | `/api/campaigns/` | List campaigns | Query: `skip`, `limit` | `List[CampaignPublic]` |
| GET | `/api/campaigns/{campaign_id}` | Get campaign | Path `campaign_id` | `CampaignPublic` |
| PUT | `/api/campaigns/{campaign_id}` | Update campaign | JSON: any of `campaign_name`, `user_id`, `property_id` | `CampaignPublic` |
| DELETE | `/api/campaigns/{campaign_id}` | Delete campaign | Path `campaign_id` | 204 No Content |

---

## Campaign Messages (`/api/campaign-messages`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/campaign-messages/` | Create campaign message | JSON: `campaign_id` (required), optional `lead_id`, `contact_method` (`phone`/`sms`/`email`), `message_subject`, `message_body` | `CampaignMessagePublic` |
| GET | `/api/campaign-messages/` | List messages (global) | Query: `skip`, `limit`, optional `campaign_id` | `List[CampaignMessagePublic]` |
| GET | `/api/campaign-messages/{message_id}` | Get message | Path `message_id` | `CampaignMessagePublic` |
| PUT | `/api/campaign-messages/{message_id}` | Update message | JSON: any of `lead_id`, `contact_method`, `message_subject`, `message_body` | `CampaignMessagePublic` |
| DELETE | `/api/campaign-messages/{message_id}` | Delete message | Path `message_id` | 204 No Content |
| GET | `/api/campaign-messages/campaign/{campaign_id}` | Messages for a campaign | Query: `skip`, `limit`, optional `contact_method` (filters by exact method) | `List[CampaignMessagePublic]` |

`contact_method` values must be one of `phone`, `sms`, or `email`.

---

## CSV Intake (`/api/import-csv/`)

| Method | Path | Purpose | Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/import-csv/` | Upload CSV/XLSX of contacts/leads | `multipart/form-data` with file field `file` | Summary with counts and lists: created/updated contacts & leads, skipped rows, errors |

Allowed file MIME types: `text/csv`, `application/vnd.ms-excel`, and `.xlsx`. The backend normalizes headers (snake_case, lowercase) and merges rows by email/phone.

---

## Lead Search (`/api/searchLeads`)

| Method | Path | Purpose | Body Fields | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/searchLeads` | Fetch nearby leads (DB first, external providers auto-triggered) | JSON: `location_text` (string) | `aggregated_leads` (from DB after any inline refresh), optional `external_persistence` statuses, and `errors` keyed by provider |

Notes:
- Google Places & RapidAPI execute inline only when the DB cache is empty for the requested area; otherwise they enqueue background refresh jobs. GPT always runs as a background job. Check `external_persistence` for `{inserted, duplicates, failed}` counts or `{status: "queued"}`.
- If geocoding fails or a provider rejects the request, the reason is listed under `errors[source]`.
- `location_text` can be a zip code or free-form description; the backend geocodes and extracts any dynamic filters automatically.
- `aggregated_leads` always contains persisted DB leads (with real `lead_id` values). When inline fetches run, the backend saves results first and then re-queries the DB so IDs remain stable.
- External provider quotas: RapidAPI requests reset monthly with a cap of 95 calls, and Brave search requests (used by the GPT integration) are limited to 1,950 calls per month.

---

## Send Campaign Email (`/api/campaign-emails/send`)

| Method | Path | Purpose | Body Fields | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/campaign-emails/send` | Send one email template to multiple leads already linked to the campaign | `campaign_id` (int), `lead_id` (array of lead IDs), `message_subject` (string), `message_body` (string) | Hydrated `CampaignPublic` object for the campaign after the messages are queued |

Notes:
- `lead_id` must include at least one ID, and every ID must already be linked to the specified campaign via `/api/campaign-leads`.
- The endpoint records one `CampaignEmail` per lead and flips the `email_contacted` flag for each matching campaign-lead link.
- Useful for bulk drip sends where the UI already has a campaign selection and filtered lead list.

---

### Usage Tips for Frontend Developers

- Always hit the `/api` prefixed route (e.g., `/api/leads`), even when an endpoint is described relative to a resource group.
- For create/update forms, supply only the fields marked required; optional fields can be omitted rather than sent as `null`.
- Use the linking endpoints instead of including relationship IDs in create payloads—this keeps flows simple and mirrors backend expectations.
- Most GET endpoints support `skip`/`limit` pagination; keep them in query strings even if you default to `skip=0&limit=100`.

---

## Teams (`/api/teams`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/teams/` | Create team | JSON: `team_name` (required), optional `xp` | `TeamPublic` |
| POST | `/api/teams/with-admin/{admin_user_id}` | Create team with admin | JSON: `team_name` (required), optional `xp`; Path: `admin_user_id` | `TeamPublic` (creator auto-added as admin) |
| GET | `/api/teams/` | List all teams | Query: `skip`, `limit` | `List[TeamPublic]` |
| GET | `/api/teams/{team_id}` | Get team details | Path: `team_id` | `TeamPublic` (includes members list) |
| GET | `/api/teams/user/{user_id}` | Get teams for a user | Path: `user_id` | `List[TeamPublic]` |
| PUT | `/api/teams/{team_id}` | Update team | JSON: any of `team_name`, `xp` | `TeamPublic` |
| DELETE | `/api/teams/{team_id}` | Delete team | Path: `team_id` | 204 No Content |

### Team Members

| Method | Path | Purpose | Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/teams/{team_id}/members/{user_id}` | Add member to team | Query: `role` (optional, default `member`) | `TeamPublic` |
| DELETE | `/api/teams/{team_id}/members/{user_id}` | Remove member from team | Query: `requester_id` (required, must be admin) | 200 OK with message |

**Notes:**
- Only admins can remove members from a team
- Admins cannot remove themselves if they are the only admin

---

## Team Invitations (`/api/teams/.../invitations`)

### Sending Invitations (Admin)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/teams/{team_id}/invitations` | Invite user to team | Query: `sender_id` (admin); JSON: `recipient_email` | `TeamInvitationPublic` |
| GET | `/api/teams/{team_id}/invitations` | List team's invitations | Query: `requester_id` (must be admin) | `List[TeamInvitationPublic]` |
| DELETE | `/api/teams/invitations/{invitation_id}` | Cancel invitation | Query: `requester_id` (must be admin) | 204 No Content |

**Invitation Behavior:**
- If `recipient_email` belongs to an existing user → creates in-app notification
- If `recipient_email` is not in database → sends email invitation via SMTP
- Returns 409 Conflict if a pending invitation already exists for that email/team

### Receiving/Responding to Invitations (User)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/teams/invitations/user/{user_id}` | Get user's pending invitations | Path: `user_id` | `List[TeamInvitationPublic]` |
| PATCH | `/api/teams/invitations/{invitation_id}/respond` | Accept or decline invitation | Query: `user_id`; JSON: `status` (true=accept, false=decline) | `TeamInvitationPublic` |

**Response Behavior:**
- `status: true` → User is added to team as `member`, notification deleted
- `status: false` → Invitation marked declined, notification deleted
- Returns 403 if user is not the recipient
- Returns 400 if invitation already responded to

---

## Notifications (`/api/notifications`)

| Method | Path | Purpose | Query | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/notifications/user/{user_id}` | Get user's notifications | Query: `skip`, `limit`, `unread_only` (bool) | `List[NotificationPublic]` |
| GET | `/api/notifications/user/{user_id}/unread-count` | Get unread notification count | Path: `user_id` | `{ "user_id": int, "unread_count": int }` |
| GET | `/api/notifications/{notification_id}` | Get single notification | Path: `notification_id` | `NotificationPublic` |
| PATCH | `/api/notifications/{notification_id}/read` | Mark notification as read | Path: `notification_id` | `NotificationPublic` |
| PATCH | `/api/notifications/user/{user_id}/read-all` | Mark all as read | Path: `user_id` | `{ "message": str, "updated_count": int }` |
| DELETE | `/api/notifications/{notification_id}` | Delete notification | Path: `notification_id` | 204 No Content |

**Notification Schema:**
```json
{
  "notification_id": 1,
  "type": "team_invitation",
  "title": "Team Invitation: Team Name",
  "message": "User has invited you to join the team 'Team Name'",
  "viewed": false,
  "recipient_id": 2,
  "sender_id": 1,
  "invitation_id": 3,
  "created_at": "2026-01-26T12:00:00Z"
}
```

**Notification Types:**
- `team_invite` - Invitation to join a team (includes `invitation_id`)
- `team_invite_accepted` - User accepted a team invitation
- `team_removed` - User was removed from a team

---

## Automatic Invitation Linking (New User Signup)

When a new user signs up or has their contact linked, the system automatically:

1. **Checks for pending invitations** sent to that email address (case-insensitive)
2. **Links the invitation** to the new user by setting `recipient_id`
3. **Creates a notification** so the user sees the team invite in their notification bell

This happens automatically in two places:
- `POST /api/users/` - When creating a user with a `contact_id`
- `POST /api/users/{user_id}/contacts/{contact_id}` - When linking a contact to an existing user

**Flow for inviting non-users:**
1. Admin sends invitation to `newuser@example.com` (user doesn't exist yet)
2. Invitation is created with `recipient_id = NULL`, `recipient_email = "newuser@example.com"`
3. New user signs up with email `newuser@example.com`
4. System finds the pending invitation, sets `recipient_id`, creates notification
5. New user sees team invitation in notification bell immediately

---

## WebSocket Endpoints

### Notifications WebSocket

| Path | Purpose |
| --- | --- |
| `ws://host/ws/notifications/{user_id}` | Real-time notifications for a user |

**Events sent to client:**
```json
{
  "type": "new_notification",
  "notification": { /* NotificationPublic object */ }
}
```

### Team WebSocket

| Path | Purpose |
| --- | --- |
| `ws://host/ws/team/{team_id}` | Real-time team updates |

**Events sent to client:**
- `member_added` - New member joined the team
- `member_removed` - Member was removed from the team
- `invitation_sent` - New invitation was sent
- `invitation_cancelled` - Invitation was cancelled

---

## Frontend Notes

### Team Management UI

The team management page (`/team-settings`) includes:

1. **Members Tab** - Shows all team members with their roles
   - Displays member name as "First Last" (from contact)
   - Shows role badges (Admin/Member)
   - Admins can remove members (except themselves if only admin)

2. **Invitations Tab** (Admin only) - Shows pending invitations
   - Lists all pending invitations with recipient email
   - Cancel button to revoke pending invitations
   - Only visible to team admins

### Notification Bell

- Shows unread count badge
- Dropdown displays up to 3 notifications initially
- "View All" expands to show all notifications
- "Mark as Read" on individual notifications (uses PATCH)
- "Mark All as Read" button
- Team invitations show Accept/Decline buttons

### Display Names

- Team members display as "First Last" from their linked contact
- If no contact or names, falls back to username
- "Created by" shows the actual creator's name (looked up from members list)

