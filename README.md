# AnimalID

AnimalID is a production-minded MVP starter for a diploma project focused on digital pet identification. It uses Next.js, TypeScript, Tailwind CSS, and the Firebase client SDK to cover the first end-to-end flows:

- owner registration and login
- pet profile creation and editing
- QR-based public pet pages
- lost and found status
- vet or admin verification

## Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS 4
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- React Hook Form + Zod
- ESLint + Prettier

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in the Firebase values.

3. Run the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Available scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run format`

## Environment variables

The app expects these public Firebase client variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Project structure

The scaffold is organized around feature modules and reusable UI:

- `src/app` - App Router pages
- `src/components` - layout, auth, pet, and base UI components
- `src/features` - auth, pets, lost and found, verification
- `src/lib` - Firebase setup and shared helpers
- `src/constants` - routes and role constants
- `src/hooks` - shared React hooks
- `src/types` - app-level TypeScript types
- `docs` - MVP notes, flows, rules, and data structure

## MVP notes

- Public QR pages intentionally render only public-safe fields in the UI.
- Firestore cannot safely expose only selected fields from a single document to public users. For a stricter production model, split public pet data into a dedicated collection.
- The public lost-pet page includes a placeholder city filter until lost reports are connected more deeply into the rescue board.
- The public contact section is intentionally stubbed so you can decide whether to store a dedicated public rescue contact field.

## Next milestone ideas

- dedicated public contact fields for lost pets
- richer lost report creation and resolution flows
- admin dashboards and moderation
- image compression and upload progress
- Firestore indexes and stricter public data modeling
