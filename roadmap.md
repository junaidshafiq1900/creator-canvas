# Joulecorp Platform Completion — Roadmap

## Phase 1 — Player, Playback, Duration Badges
- [ ] Migration: videos.duration, comments.parent_id, dislikes, playlists, playlist_items, reports.details
- [ ] Watch.tsx: multi-source player (Vimeo iframe vs HTML5), graceful fallback
- [ ] Upload.tsx: capture duration on file select; store in insert
- [ ] VideoCard + Channel/History/Videos/Index cards: duration badge
- [ ] Watch.tsx: Up Next sidebar + Autoplay toggle + 5s countdown navigation

## Phase 2 — Engagement & Moderation
- [ ] Threaded comment replies (Reply button, inline input, nested render, "View X replies")
- [ ] Like/Dislike pill group (mutually exclusive)
- [ ] Share modal: social targets, copy, start-at-timestamp
- [ ] Report modal on Watch page + comment rows → reports table
- [ ] AdminReports: show details, dismiss + resolve + hide flagged item

## Phase 3 — Playlists & Watch Later
- [ ] Save-to-playlist modal (checkboxes + new playlist inline + Watch Later default)
- [ ] /playlist/:id page with queue sidebar and sequential playback
- [ ] Navbar/dropdown Playlists link

## Phase 4 — Creator Management & Analytics
- [ ] Edit/Delete video modal on Watch page (creator or admin)
- [ ] Analytics summary (views, likes, followers, top video) on Profile + Channel

## Phase 5 — Legal, SEO, Polish
- [ ] /terms, /privacy, /dmca pages wired into Footer
- [ ] Dynamic OG meta tags on Watch page
- [ ] Empty states on Subscriptions, Search, Channel tabs
- [ ] Typecheck + build verification
