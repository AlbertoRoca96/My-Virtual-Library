# Supabase and deployment setup

## 1. Supabase SQL to paste into the SQL editor

Paste the contents of:

- `supabase/migrations/0001_initial_schema.sql`

into the Supabase SQL editor and run it.

That script creates:
- `profiles`
- `books`
- `genres`
- `book_genres`
- update triggers
- profile auto-create trigger on signup
- RLS policies
- max-3-genres enforcement

## 2. Do we need edge functions right now?

No.

For v1 we do not need a Supabase Edge Function for:
- auth
- books CRUD
- genre linking
- ISBN lookup

Why not:
- auth is handled by Supabase client auth
- CRUD is handled by the client under RLS
- ISBN lookup can call Open Library directly from the client

Use edge functions later only if we want:
- private API key fan-out to Google Books fallback
- server-side rate limiting
- background enrichment jobs
- scheduled sync or import flows

## 3. Do we need a storage bucket right now?

Not required for the current app build.

The app currently supports text-first book records.

Create a bucket only when you want:
- custom cover uploads
- profile avatars
- moodboard/header images

Recommended future bucket names:
- `book-covers`
- `profile-avatars`

## 4. Do we need GitHub secrets right now?

### For GitHub Pages web deploy
You do not need true secrets for the web client env values because these are public client-side values anyway.

Set these as **GitHub Actions repository variables**:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not use a service role key in GitHub Pages builds.
That would be galaxy-brain bad.

### For Expo / EAS later
If you automate mobile builds in GitHub Actions later, then you may want:
- `EXPO_TOKEN` as a GitHub secret

But for now that is optional.

## 5. GitHub Pages setup

A workflow already exists at:
- `.github/workflows/deploy-web.yml`

It will:
1. install dependencies
2. export the Expo web build
3. rewrite paths for the repo Pages subpath
4. deploy `dist/` to GitHub Pages

Because this is a project repo, Pages will live under:
- `/My-Virtual-Library`

The rewrite step exists because GitHub Pages loves adding just enough friction to stay interesting.

## 6. Android and iOS direction

### Android now
Already optimized enough to continue with Expo.
Next step for Android is testing the auth and CRUD flows in Expo Go or an EAS development build.

### iOS later
The same codebase is fine for iOS.
You will just need:
- Apple developer setup when you actually ship
- EAS build configuration

## 7. Recommended next implementation steps

1. run the SQL in Supabase
2. test sign up and sign in
3. test adding a book
4. test deleting a book
5. wire ISBN scanning to Open Library
6. optionally add cover-image upload bucket
