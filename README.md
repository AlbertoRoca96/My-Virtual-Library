# My Virtual Bookshelf

A cozy cross-platform book catalogue built with Expo, React Native Web, and Supabase.

## Stack

- Expo
- React Native
- React Native Web
- Expo Router
- Supabase
- TanStack Query
- React Hook Form
- Zod
- NativeWind
- Expo Camera / barcode scanning

## Current build status

This repo now includes:

- Supabase auth wiring for email/password and magic links
- real books CRUD hooks against Supabase
- live bookshelf and add-book screens
- warm vintage-inspired starter UI
- Expo Router navigation
- NativeWind configuration
- a starter GitHub Pages deploy workflow for the web build
- a starter Supabase migration for profiles, books, genres, and book_genres

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

3. Run the app

```bash
npm run web
```

or

```bash
npm run start
```

## Expo phone testing

This repo can run through Expo so you can scan a QR code on Android/iPhone and test it as an app instead of only through the GitHub Pages URL.

### First-time setup

```bash
cd C:\Users\alroc\My-Virtual-Bookshelf
npm install
npx expo install
```

Install **Expo Go** on your phone first.

### Start the Expo dev server

```bash
cd C:\Users\alroc\My-Virtual-Bookshelf
npx expo start
```

If your phone and laptop are on the same Wi-Fi, scan the QR code from the terminal/browser with Expo Go.

### If LAN is annoying, use tunnel mode

```bash
cd C:\Users\alroc\My-Virtual-Bookshelf
npx expo start --tunnel
```

### Open directly on Android from the terminal

```bash
cd C:\Users\alroc\My-Virtual-Bookshelf
npm run android
```

That opens the Expo project on Android when a device/emulator is available.

### Useful reset command if Metro gets weird

```bash
cd C:\Users\alroc\My-Virtual-Bookshelf
npx expo start -c
```

### Current platform reality

- **GitHub Pages URL** = web testing
- **Expo Go / Expo dev server** = app-style testing on phone
- **EAS build later** = installable APK / AAB / App Store style builds

For Android specifically, Expo Go testing is the next correct move if you want the app to behave more like an actual app view instead of only a mobile browser page.

## Supabase setup

Paste and run:

- `supabase/migrations/0001_initial_schema.sql`

in the Supabase SQL editor.

More setup notes live in:

- `docs/SUPABASE_AND_DEPLOYMENT.md`

## Web deployment

Important: this GitHub Pages app should only use the Supabase project URL and publishable key. Do not put `SUPABASE_SECRET_KEY`, `sb_secret_*`, or service-role credentials into frontend env vars or GitHub Pages variables.


This repo includes:

- `.github/workflows/deploy-web.yml`

For GitHub Pages, set these **repository variables**:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then enable GitHub Pages to deploy from GitHub Actions.

## Mobile deployment

You do not need `@supabase/server` for the current Expo web/mobile client. That package is for server runtimes only.


For Android and iOS later, use Expo / EAS.

You do not need Edge Functions for v1 auth and CRUD.
You also do not need a storage bucket yet unless you want cover or avatar uploads.

## Suggested next steps

1. run the SQL migration in Supabase
2. test auth
3. test add / list / delete books
4. wire Open Library ISBN lookup
5. add scanning flow for Android first
6. later add storage buckets for cover uploads if wanted
