# Tech Stack Documentation — Samarthya Portal

> 📖 **Full Documentation Suite**: For exhaustive system documentation, user journeys, mathematical formulas, and API specs, please refer to the [Complete Documentation Suite (documentation/README.md)](../documentation/README.md).

## 1. System Architecture Overview
**Samarthya** is an intelligent government scheme matching platform designed to connect special-needs students with welfare schemes. It follows a decoupled, modular architecture featuring a high-performance vanilla frontend, a lightweight Python FastAPI microservice, and offline-capable client storage.

```
┌────────────────────────────────────────────────────────┐
│               Frontend Client (SPA)                    │
│  HTML5 • Vanilla CSS3 Tokens • ES6+ Modular Modules    │
└───────────────┬────────────────────────┬───────────────┘
                │ (REST / JSON)          │ (Local State)
┌───────────────▼──────────────┐  ┌──────▼───────────────┐
│     Backend Microservice     │  │ Client-side Storage  │
│  FastAPI • Pydantic • Python │  │ IndexedDB • Storage  │
└──────────────────────────────┘  └──────────────────────┘
```

---

## 2. Frontend Layer
- **Core Structure:** Semantic **HTML5** Single-Page Application (SPA) structure with hash-based view routing.
- **Styling Architecture:** Modular **Vanilla CSS3** leveraging CSS custom properties (Design Tokens), responsive flexbox/grid layouts, and glassmorphism styling.
  - `main.css`: Base variables, ambient glow effects, resets, layout primitives.
  - `components.css`: Buttons, cards, modals, tabs, forms, badges, tooltips.
  - `auth.css` & `admin.css`: Dedicated styling for role auth and administrative panels.
  - `features.css`: Specific styles for OCR upload, NGO camp mode, WhatsApp simulator.
- **JavaScript (Logic & State):** Modular **Vanilla ES6+** without heavy framework overhead for near-instant load times.
- **Typography & Icons:** Google Fonts (`Plus Jakarta Sans`, `Outfit`, `Inter`, `Fira Code`).

---

## 3. Backend & API Services
- **Runtime & Framework:** **Python 3.14+** running on **FastAPI** with **ASGI (Uvicorn)** server.
- **Data Validation & Serialization:** **Pydantic v2** models enforcing type-safe payloads for student profiles, SC entrepreneur profiles, and scheme matching.
- **Middleware:** `CORSMiddleware` configured for local and production cross-origin resource requests.
- **API Endpoints:**
  - `GET /api/metadata`: Provides Indian states, education levels, disability classifications, and scheme categories.
  - `GET /api/schemes`: Delivers the complete database of state and central welfare schemes.
  - `POST /api/match`: Server-side scoring engine ranking welfare scheme eligibility by age, disability type/percentage, state, and income.
  - `GET /api/credit-schemes`: Delivers the statutory database of NSFDC concessional loan schemes (Term Loan, Micro Finance, Education Loan).
  - `GET /api/channel-partners`: Delivers 25+ channel partner branches (SCAs, PSBs, RRBs) with state and NPA/health filtering.
  - `POST /api/match-credit`: Server-side scoring engine ranking NSFDC credit schemes against entrepreneur criteria (SC certificate, ≤ ₹5.0L income, project cost, sector, and partner availability).

---

## 4. Data Storage & Persistence
- **Client-Side Database:** **IndexedDB** wrapped with helper layer (`js/db.js`) for storing user profiles, saved scheme bookmarks, application logs, and offline audit trails.
- **Session & Fallback Storage:** `localStorage` / `sessionStorage` for user preferences (theme/contrast), tracked applications, and camp mode batches.
- **Backend Data Source:** Structured `schemes.json` flat-file document store acting as the central knowledge base for both welfare and credit schemes.

---

## 5. Core Feature Modules
| Module | File | Implementation Details |
| :--- | :--- | :--- |
| **Welfare Matching Engine** | `js/matcher.js` & `backend/main.py` | Multi-criteria scoring algorithm (0–100%) weighting disability type, percentage, income ceilings, age brackets, and state residency. |
| **Credit Matching Engine (SIH26093)** | `js/credit-matcher.js` & `backend/main.py` | 5-checkpoint weighted client-side credit matching engine evaluating SC category, ≤ ₹5L income limit, project cost, sector viability, and channel partner availability. |
| **Financial EMI & Moratorium Calculator** | `js/financial-calculator.js` | Interactive slider-driven loan simulator calculating EMI, moratorium interest (waived vs capitalized), commercial market rate savings comparison, and CSV export. |
| **Channel Partner Geo-Locator** | `js/partner-locator.js` | Embedded Leaflet.js map with Haversine distance calculation and "Nearest Capable" filter hiding high-NPA branches by default. |
| **Accessibility Suite** | `js/accessibility.js` | WCAG-compliant high-contrast modes, dyslexia-friendly fonts, font resizing, and Web Speech API / TTS integration. |
| **Multilingual Engine** | `js/i18n.js` | Zero-dependency client-side translation engine supporting English and Hindi across all welfare and credit tracks. |
| **Application Tracker** | `js/tracker.js` | Dual-pipeline status tracker (welfare DBT & credit sanction stages) with `.ics` calendar deadline export. |
| **WhatsApp Assistance** | `js/whatsapp-lead.js` | Guided chatbot simulation with deep-link WhatsApp Web sharing. |
| **NGO & DIC Camp Mode** | `js/ngo-mode.js` | Dual-batch processing for multi-student disability camps and DIC / SC-ST Hub entrepreneur loan mobilization with CSV import/export. |
| **AI Virtual Assistant** | `js/samarthya-ai.js` | Client-side intelligent assistant answering welfare & NSFDC credit queries with context-aware suggestions. |
| **Voice Matching** | `js/wispr-flow.js` | Voice-driven intake modal powered by speech recognition for accessible hands-free navigation. |

---

## 6. Runtime & Tooling
- **Local Dev Server:** Python HTTP Server (Frontend `:5500` / `:3000`) & Uvicorn ASGI Server (Backend `:8000`).
- **Dependencies:** FastAPI (`>=0.100.0`), Uvicorn (`>=0.22.0`), Pydantic (`>=2.0.0`), Leaflet.js (`1.9.4`).
