# AnimalID MVP Scope

## Core goal

Ship a working web MVP for digital pet identification with just enough structure to demonstrate the full product direction.

## In scope

- responsive landing page
- owner registration and login
- Firebase Auth session handling
- owner dashboard
- create, edit, and list pet profiles
- optional pet image upload to Firebase Storage
- QR code generation for public pet pages
- public pet page by `publicQrId`
- public lost pets listing
- mark pet as lost or found
- vet or admin verification queue
- starter Firebase rules and project documentation

## Intentionally light in this starter

- no custom backend server
- no mobile app
- no MongoDB
- no payment flows
- no advanced search indexing
- no notifications
- no map integrations
- no analytics layer
- no public owner contact field yet

## Recommended next step after this scaffold

Create a dedicated public contact model for lost pets so public QR scans can safely reach the owner without exposing private account documents.
