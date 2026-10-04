# To do

Last updated October 3, 2026.

## Members version (needed before others can use it)

- [ ] **Turn on the sign-up hook** (if not done): Supabase → Authentication → Hooks → Add hook → Before User Created → Postgres → schema `public`, function `hook_before_user_created`.
- [ ] **Set the sign-in return address** (if not done): Supabase → Authentication → URL Configuration. Site URL `https://bcbarb24.github.io/road-to-1000/members/`; add `https://bcbarb24.github.io/road-to-1000/members/**` to Redirect URLs.
- [ ] **Sign in as the owner** at https://bcbarb24.github.io/road-to-1000/members/ to test, and check the Admin badge and Admin page appear.
- [ ] **Connect an email sender** so other players receive sign-in links. Supabase's built-in email only reaches members of the Supabase account, a few per hour. Options: Gmail SMTP with an app password (Authentication → Emails → SMTP Settings), or enable Google sign-in (Authentication → Sign In / Providers; a "Continue with Google" button then appears automatically).
- [ ] **Approve players** on the Admin page (use a parent's email for children under 13).
- [ ] **Real two-account test:** host and join a game with two signed-in accounts on two devices; confirm hands appear in stats and the admin history. (So far tested only against a stand-in for Supabase.)

## Optional

- [ ] **Purge cached old commits** that still contain the owner's Gmail: ask GitHub Support to remove cached data for `bcbarb24/road-to-1000` (see GitHub's "Removing sensitive data from a repository").
- [ ] **Test the members version locally** with the Supabase CLI and Docker (full local copy of sign-in, database, live updates and a test inbox).
- [ ] **Stats dashboard:** point Metabase (runs in Docker) at the Supabase database to chart players, win rates and points.
- [ ] **Card art:** decide whether to switch to one of the alternatives in [`design/`](design/art-options.png). The current design stays for now.
- [ ] **Reshuffle setting:** optionally make the discard reshuffle a choice before dealing (Never / Once / Every time). It is currently always on.
- [ ] **Delete the old Claude-hosted prototype** (https://claude.ai/artifact/MegbGUAY1ZMGSZk9ySwiGe) now that the GitHub version replaces it.

## Done

- [x] Family and friends version: online play with a code, pass and play, practice vs Robo, reshuffle house rule.
- [x] Members version: sign-in with approved emails, saved games, stats, admin page, database security rules.
- [x] Owner's Gmail removed from the repository files and history; GitHub email privacy settings turned on.
- [x] Disclaimer added to both versions and the README.
