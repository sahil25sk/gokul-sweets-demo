# Gokul Sweets & Restaurant — Demo

Target: Gokul Sweets & Restaurant, Rajpur, Bihta.

## Included
- Responsive customer website
- Premium warm sweets/restaurant visual direction
- Theme switcher
- Product cards clickable anywhere, not image-only
- Product detail modal
- Mobile-friendly footer/header
- Admin login with password visibility toggle
- Full product CRUD
- Stock quantity + automatic Out of Stock at zero
- Featured + Active/Hidden toggles
- JSON persistence for the demo

## Local run
1. Install Node.js 20+.
2. Open this folder in VS Code.
3. Terminal:
   npm install
   npm start
4. Open http://localhost:3000
5. Admin: http://localhost:3000/admin.html

Demo admin defaults:
Email: admin@gokulsweets-demo.local
Password: GokulDemo@2026

For a real client deployment, set ADMIN_EMAIL, ADMIN_PASSWORD and SESSION_SECRET as Render environment variables.

## Render
Root Directory: leave EMPTY if this repository contains these files at its root.
Build Command: npm install
Start Command: npm start
No SMTP/SMS provider is required for this demo.
No .env file is required on Render; use Render Environment Variables instead.

Important: Render's free web-service filesystem is ephemeral. JSON changes are suitable for a demo, but for a production client handoff, connect the same API to a persistent database (Postgres/Supabase/etc.) before promising permanent admin edits across redeploys.

## Research note
The public web has multiple Gokul Sweets listings. The Bihta listing identifies the target as a mithai/sweets business with restaurant positioning and lists Rajpur, Bihta and phone +91 93084 57669. The well-known Patna Gokul brand also has an official site, but this demo does not claim that the Bihta shop is the same corporate branch without confirmation.
