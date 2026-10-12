<div align="center">

# 🩺 Primary Care Learning Companion — AI Assistant

**AI-powered learning assistant for primary healthcare. Next.js 15 + Genkit/Gemini + Postgres + Supabase.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://asistente-inteligente.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)

**[🚀 Live Demo](https://asistente-inteligente.vercel.app) · [📦 Repo](https://github.com/FelipeDiazAimar/AsistenteInteligente) · [🇪🇸 Español](README.md)**

</div>

## What is it?

Web app for primary-care learning and reference: intelligent chat (Genkit + Google Gemini / OpenRouter), **PDF analysis as chat context** (`pdf-parse`), organized resource library (PDFs, videos, images, articles), secure auth portal (JWT + bcryptjs, roles), full admin dashboard (users, resources, sessions), dark/light mode, mobile-first responsive (sidebar → drawer, circular buttons).

## Demo mode (zero config)

Works right after install: chat with 3 preloaded notes (hypertension, type-2 diabetes, adult vaccination), demo resources, 5-question quiz, admin login `admin@demo.local` / `demo1234` at `/admin/login`.

```bash
npm install
npm run dev
# 👉 http://localhost:9002
```

Real mode: `.env.local` with `NEXT_PUBLIC_DEMO_MODE=false` + `DATABASE_URL` + `SUPABASE_URL/ANON_KEY` + `JWT_SECRET` (32+ chars) + `GOOGLE_API_KEY`/`OPENROUTER_API_KEY`; then `npm run setup-db` (+ `setup-db-pg`), `npm run add-admin`. Details in `docs/MODO-DEMO.md`.

## Stack & scripts

Next `15.5.27` (Turbopack `:9002`) · React `18.3` · TS `5.8` · Tailwind `3.4` + shadcn/Radix · Genkit `1.12` + Google AI · Supabase `2.50` + `pg 8.16` · JWT/bcryptjs · TanStack Query `5.66` · Recharts · RHF + Zod · Express `5.1` custom `server.js` (compression, `npm start` = `node server.js`) · `pdf-parse` · OpenTelemetry Jaeger. Scripts: `dev/build/start/lint/typecheck/test-build/build-safe/hash-passwords/setup-db(-pg)/add-admin/clean-sessions`.

## Author

**Felipe Diaz Aimar** — https://www.linkedin.com/in/felipe-aimar/ · felipediazaimar@gmail.com · https://github.com/FelipeDiazAimar · Live: https://asistente-inteligente.vercel.app
