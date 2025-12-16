# MAHSA MicroLearn Platform

This is a React-based Progressive Web App (PWA) prototype for the MAHSA Specialist Hospital Microlearning platform.

## 🚀 How to Run (For IT)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Locally:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```
    The output will be in the `dist/` folder. Serve this folder using any static web server (Nginx, Apache, Vercel, Netlify).

## ⚠️ Important Architecture Note

**Persistence Strategy: LocalStorage**

This application currently uses `localStorage` for data persistence. This means:
1.  **Data is isolated per device.** (Courses created on Device A will NOT appear on Device B).
2.  **No Backend.** There is no centralized API or Database connected.

**For Production Use:**
To enable centralized course management where Educators push content to all Nurses, this app must be connected to a backend service (e.g., Firebase, Supabase, or a REST API).

## Tech Stack
*   React 18
*   TypeScript
*   Tailwind CSS (via CDN)
*   Vite
*   Lucide React (Icons)
*   Recharts (Analytics)
