# User Flows

## Owner flow

1. Open landing page.
2. Register with name, email, and password.
3. Get redirected to the dashboard.
4. Create a pet profile.
5. Optionally upload a pet image.
6. Open the pet details page and access the generated QR code.
7. Mark the pet as lost or found when needed.

## Public QR flow

1. Scan the QR code.
2. Open `/p/[publicQrId]`.
3. View public-safe pet details.
4. If the pet is marked as lost, see the rescue contact placeholder section.

## Lost pets board flow

1. Open `/lost-pets`.
2. View pets where `isLost == true`.
3. Optionally filter by species.
4. Open each public page for more context.

## Vet or admin verification flow

1. Sign in with a user whose Firestore role is `vet` or `admin`.
2. Open `/admin/verification`.
3. Review the unverified list.
4. Verify the pet profile.

## Recommended future flows

- owner-submitted lost report form
- public contact handoff for lost pets
- verification request audit trail
- admin role management
