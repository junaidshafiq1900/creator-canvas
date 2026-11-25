# Joulecorp Platform Completion — Roadmap

## Phase 1 — Player, Playback, Duration Badges (done)
- [x] Migration: videos.duration, comments.parent_id, dislikes, playlists, playlist_items, reports.details
- [x] Watch.tsx: multi-source player (Vimeo iframe vs HTML5), graceful fallback
- [x] Upload.tsx: capture duration on file select; store in insert
- [x] VideoCard + all pages: duration badge
- [x] Watch.tsx: Up Next sidebar + Autoplay toggle + 5s countdown navigation

## Phase 2 — Engagement & Moderation (done)
- [x] Threaded comment replies (Reply button, inline input, nested render, View/Hide replies)
- [x] Like/Dislike pill group (mutually exclusive)
- [x] Share modal: X/WhatsApp/Telegram/Reddit/LinkedIn, copy, start-at-timestamp
- [x] Report modal on Watch page + comment rows → reports table
- [x] AdminReports: details shown, Dismiss + Resolve + Hide flagged video

## Phase 3 — Playlists & Watch Later (done)
- [x] Save-to-playlist modal (checkboxes + new playlist inline + Watch Later default)
- [x] /playlist/:id page with queue sidebar and sequential playback
- [x] /playlists listing page; navbar + dropdown + mobile + footer links

## Phase 4 — Creator Management & Analytics (done)
- [x] Edit/Delete video modal on Watch page (creator or admin/moderator)
- [x] Analytics summary (views, likes, followers, top video) on Profile + own Channel

## Phase 5 — Legal, SEO, Polish (done)
- [x] /terms, /privacy, /dmca pages wired into Footer
- [x] Dynamic OG/Twitter meta tags on Watch page (verified: title updates)
- [x] Empty states verified on Subscriptions, Search, Playlists, History, Channel tabs
- [x] Typecheck (tsgo clean) + build OK + Playwright page pass

## Fixes found during build
- [x] Signed-out browsing was broken: admin RLS policies evaluated private.has_role for anon → recreated 14 policies scoped TO authenticated

## Phase 6 — Switchable Site Skin (done)
- [x] Add an admin-controlled site-wide Joulecorp / YouTube-inspired layout setting
- [x] Use the existing platform settings access rules for public reads and admin-only changes
- [x] Add a compact recommendation feed, creator metadata, and collapsible desktop navigation
- [x] Verify skin parsing tests and desktop/mobile layout behavior

## Phase 7 — Selected security findings (in progress)
- [x] Restrict public platform-setting reads to the active site appearance
- [x] Bind thumbnail upload, replacement, and removal to the signed-in owner
- [ ] Resolve six public profile, comment, like, and follow read policies after visibility choice
