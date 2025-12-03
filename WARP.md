# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

# Project Overview
This is a **Next.js 15+ (App Router)** application designed to generate and manage poster documents. It leverages **Google Vertex AI** for style analysis and image generation, **Cloudinary** for asset management, and **@react-pdf/renderer** for PDF document creation.

# Development

## Prerequisites
- Node.js (v20+)
- A valid `.env.local` file with the required keys (see below).

## Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# Google Vertex AI
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_CREDENTIALS_BASE64=base64-encoded-service-account-json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> **Note**: The Cloudinary upload preset is currently hardcoded as `"Ustica-info-hub"` in `app/lib/cloudinary.ts`. Ensure this preset exists in your Cloudinary console or update the code.

## Common Commands
- **Start Development Server**: `npm run dev` (Runs on http://localhost:3000)
- **Build for Production**: `npm run build`
- **Start Production Server**: `npm run start`
- **Lint Code**: `npm run lint`

# Architecture

## Core Structure
- **`app/`**: Contains the Next.js App Router structure.
    - **`actions/`**: Server Actions handling backend logic.
        - `analyzeStyle.ts`: Uses Vertex AI to analyze text/style.
        - `generateImage.ts`: Handles image generation via Vertex AI.
    - **`components/`**: Reusable React components.
    - **`documents/`**: PDF definitions using `@react-pdf/renderer` (e.g., `PosterDocument.tsx`).
    - **`lib/`**: Shared utilities and client configurations.
        - `vertex.ts`: Configures the Vertex AI client.
        - `cloudinary.ts`: Handles Cloudinary uploads and deletions.

## Key Workflows
1.  **Image Generation**: Triggered via Server Actions (`app/actions/generateImage.ts`), utilizing Google Vertex AI.
2.  **PDF Creation**: The application renders PDFs on the client side using `@react-pdf/renderer`, wrapping them in components like `PDFViewerWrapper.tsx`.
3.  **Asset Storage**: generated images are uploaded to Cloudinary using the `uploadImage` utility in `app/lib/cloudinary.ts`.

## Styling
The project uses **Tailwind CSS** (v4) configured via `globals.css`.
