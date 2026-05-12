# Aura Pulse90 — Local Setup Guide

## Prerequisites

Before running the project locally, ensure the following are installed:

- Node.js
- npm
- Firebase CLI
- Git

---

# Clone Repository

```bash
git clone https://github.com/arun-kalita/aura-pulse90.git
cd Fit_90
```

---

# Install Dependencies

```bash
npm install
```

---

# Start Development Server

```bash
npm run dev
```

The app will run locally at:

```text
http://localhost:5173
```

---

# Firebase Configuration

Create a `.env` file and add Firebase credentials.

Example:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

# Production Build

```bash
npm run build
```

---

# Firebase Deployment

```bash
firebase deploy
```

---

# Live Product

https://aura-pulse90.web.app

---

Arunjyoti Kalita · Aura Pulse90 Setup Guide
