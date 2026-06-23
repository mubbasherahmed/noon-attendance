# Noon Attendance Management System

A modern, production-ready attendance management web application built with **Next.js**, **TypeScript**, and **Tailwind CSS**. Uses **Google Sheets** as its primary database via the Google Sheets API.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-34a853?style=flat-square&logo=google-sheets)

## Features

- **Multi-Campus Management** — Global campus selector filters all rooms, sheets, and students
- **Room Management** — View rooms with assigned sheets, swap sheet assignments dynamically
- **Fast Attendance Marking** — Optimistic UI with instant counter increments (zero perceived lag)
- **Smart Batch Writing** — "Save Session" aggregates all changes into a single Google Sheets API call
- **Student Transfers** — Move students between sheets with automatic counter merging
- **Mobile Responsive** — Tap-friendly buttons optimized for smartphones and tablets
- **Dark Theme** — Premium glassmorphic design with smooth animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Google Sheets API (googleapis) |
| Icons | Lucide React |
| Notifications | Sonner |
| Deployment | Vercel |

## Google Sheet Setup

Your Google Spreadsheet must contain these exact tabs:

### "Rooms" Tab
| Room ID | Room Name | Current_Sheet_Name | Campus_Name |
|---------|-----------|-------------------|-------------|
| R001 | Room 101 | Sheet A | Main Campus |
| R002 | Room 102 | Sheet B | Main Campus |

### "Attendance_Data" Tab
| Sheet_Name | Student ID | Student Name | Roll Number | Attendance_Counter | Campus_Name |
|-----------|-----------|-------------|-------------|-------------------|-------------|
| Sheet A | S001 | John Doe | 101 | 5 | Main Campus |
| Sheet A | S002 | Jane Smith | 102 | 3 | Main Campus |

## Getting Started

### Prerequisites

1. **Node.js** 18+ installed
2. **Google Cloud Project** with Sheets API enabled
3. **Service Account** with Editor access to your Google Sheet

### Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd noon-app
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials:
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your-spreadsheet-id
   ```

3. **Share your Google Sheet** with the service account email (Editor access)

4. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
3. Add these **Environment Variables** in Vercel:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
4. Deploy!

> **Note**: When adding `GOOGLE_PRIVATE_KEY` in Vercel, paste the key **without** wrapping quotes. Vercel handles the escaping automatically.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── attendance/route.ts    # Batch save attendance
│   │   ├── campuses/route.ts      # Get campus list
│   │   ├── rooms/route.ts         # Get/swap rooms
│   │   └── students/
│   │       ├── route.ts           # Get students
│   │       └── transfer/route.ts  # Transfer students
│   ├── room/[roomId]/page.tsx     # Attendance marking
│   ├── transfer/page.tsx          # Student transfers
│   ├── page.tsx                   # Dashboard
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Design system
├── components/
│   ├── attendance/                # StudentRow, AttendancePanel
│   ├── dashboard/                 # CampusSelector, RoomCard, RoomGrid
│   ├── transfer/                  # TransferModal
│   └── ui/                        # Modal, LoadingSpinner, Toast
├── context/
│   └── AppContext.tsx              # Global state management
└── lib/
    ├── google-sheets.ts           # Sheets API client
    └── types.ts                   # TypeScript interfaces
```

## License

MIT
