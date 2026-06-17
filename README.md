# 🚀 TalentDash — Compensation & Career Intelligence Platform

TalentDash is a high-performance, data-first compensation intelligence platform built to serve structured, comparable, and decision-ready career metrics at internet scale. Unlike traditional job boards or company review hubs, TalentDash is designed with a static-first, zero-infrastructure-cost architecture optimized for search engine crawl efficiency (SEO) and global content caching.

---

## 📖 Overview

In modern recruiting, compensation data is noisy and unstructured. TalentDash bridges this gap by enforcing standard data normalization rules at ingestion boundaries to map various job levels, locations, currencies, and roles into clean, structured indices. The core business engine relies on high traffic driven by search engines (SEO) to prebuilt landing pages, which serve career intelligence at global edges (via Cloudflare Pages/CDN) with minimal database server costs.

---

## 🌟 Features

* **Salary Intelligence Feed (`/salaries`)**: Responsive, paginated compensation table displaying salary packages (base salary, performance bonus, stock options, and total compensation) formatted using the Indian Numbering System (Lakh/Crore) and local USD structures.
* **Filter Bar & Parameters Synced Navigation**: Instant search filtering by company name, role selection, level multi-select options, location, and currency toggle. URL states sync parameters for shareable links.
* **Company Profiles (`/companies/[slug]`)**: Dynamic static pages (SSG/ISR) computing true statistical medians, compensation ranges, total contributions, and stacked Level Distribution visual bars.
* **Side-by-Side Comparison Tool (`/compare`)**: side-by-side comparison selector calculating difference deltas for every financial compensation element with green/red differential formatting and "Higher TC" winner badges.
* **Verification & Duplicate Protection**: Anti-spam mechanisms that reject similar submissions (within 10% bounds) from the same company, role, level, and location within a 48-hour throttle window.
* **Structured Data SEO Integration**: Deep metadata optimization, canonical URLs, and schema.org integration (Dataset on salaries, Organization on company profiles, and WebPage on comparison views) to maximize search engine crawlers indexing rates.

---

## 🛠️ Tech Stack

* **Core Framework**: Next.js 15 (App Router, strict TypeScript)
* **Styling**: Tailwind CSS (custom design system, no component library dependencies)
* **Database**: Serverless PostgreSQL via Neon
* **ORM**: Prisma ORM (Version 7)
* **Database Driver**: `pg` with `@prisma/adapter-pg` driver adapter
* **Execution Engines**: `tsx` (TypeScript execute script runner)

---

## 🏛️ Architecture

TalentDash uses a **Services-Oriented Architecture** that separates database schemas, application business logic services, API endpoints, and visual rendering structures.

### Visual Architecture Diagram
```mermaid
graph TD
  User([User / Crawler]) -->|HTTP request| CDN[Cloudflare CDN Edge Cache]
  CDN -->|Cache Miss| NextJS[Next.js 15 App Router]
  NextJS -->|RSC Direct Query| ServiceLayer[Services Layer: validation.ts, company-service.ts, salary-service.ts]
  NextJS -->|Dynamic Fetch| APILayer[API Route Handlers: GET salaries, GET company, GET compare]
  APILayer -->|Call services| ServiceLayer
  ServiceLayer -->|Prisma Client| DB[(Neon PostgreSQL)]
```

### Static vs Dynamic Page Strategies
To optimize page speed and minimize infrastructure billing:
* **`/salaries` (Dynamic RSC)**: Uses `force-dynamic` because it depends on URL parameters (`searchParams`). Direct service queries bypass HTTP overhead.
* **`/companies/[slug]` (SSG + ISR)**: Pre-generates known companies at compile time via `generateStaticParams()`. New records trigger Incremental Static Regeneration (ISR) hourly (`revalidate = 3600`) to maintain freshness.
* **`/compare` (Dynamic Client Hydration)**: Static container shell rendered on the server, with side-by-side comparative datasets loaded asynchronously by the client to keep interactions snappy.

---

## 📡 API Endpoints

### 1. Ingest Salary
* **Endpoint**: `POST /api/ingest-salary`
* **Purpose**: Ingests new salary records, cleans names, recomputes total compensation, checks for duplicate submissions, and creates database records.
* **Response status**: `201 Created` on success, `400 Bad Request` on validation failure, `409 Conflict` on duplicate detection.

### 2. Search Salaries
* **Endpoint**: `GET /api/salaries`
* **Purpose**: Queries salaries using filtering, sorting, page index parameters, and caps query outputs to 100 entries. Includes `Cache-Control` header settings.

### 3. Company Metadata & Statistics
* **Endpoint**: `GET /api/companies/[slug]`
* **Purpose**: Returns company summary profiles, calculated medians, level distribution indexes, and full salary listings sorted by total compensation descending.

### 4. Side-by-Side Comparison
* **Endpoint**: `GET /api/compare`
* **Purpose**: Validates query IDs (UUID format check) and returns side-by-side statistics alongside calculated difference deltas.

---

## 🗄️ Database Design

```mermaid
erDiagram
    COMPANY {
        string id PK "UUID"
        string name
        string slug UK
        string normalized_name UK "Lowercase name index"
        string industry
        string headquarters
        int founded_year
        string headcount_range
        DateTime created_at
        DateTime updated_at
    }
    SALARY {
        string id PK "UUID"
        string company_id FK
        string role
        Level level "Enum"
        string location
        Currency currency "Enum"
        int experience_years
        int base_salary
        int bonus
        int stock
        int total_compensation "Indexed"
        Source source "Enum"
        float confidence_score
        boolean is_verified
        DateTime submitted_at "Indexed"
    }
    COMPANY ||--o{ SALARY : "has"
```

### Index Choices
* **`@@index([company_id, level, location])`**: Built to support filters on salaries and company pages.
* **`@@index([location, level])`**: Built to optimize regional queries and location filtering.
* **`@@index([total_compensation])`**: Speeds up sorting operations by compensation.
* **`@@index([submitted_at])`**: Optimizes sorting by date and accelerates duplicate checking algorithms.

---

## ⚖️ Trade-Off Decisions & Compliance Rationale

### 1. Int vs BigInt
Salary and compensation values are stored as `Int` rather than `BigInt`. This avoids JSON serialization complexity in Next.js API responses while still comfortably supporting all expected compensation ranges. For instance, ₹40 Crore equals 400,000,000, which fits within the 32-bit signed integer limit of 2,147,483,647.

### 2. Page-Based vs Cursor-Based Pagination
Page-based pagination is used to keep search URLs shareable (e.g., `/salaries?page=3`). This approach allows search engines to crawl all page indices easily, which fits our SEO-driven business model better than cursor-based navigation.

### 3. Application-Level Constraint Enforcement
Database check constraints (such as `experience_years` bounds) are enforced inside `validation.ts` rather than raw SQL schema migrations to keep database schema changes portable and type-safe.

### 4. Cache-Control CDN TTL Decisions
- **`/api/salaries` (s-maxage=300, stale-while-revalidate=3600)**: General salary queries are cached for 5 minutes. This ensures repeat paginated loads load instantly at the edge while allowing new ingest submissions to propagate to search grids reasonably quickly. Allowing stale data for up to 1 hour ensures no user request is blocked waiting on database queries during traffic spikes.
- **`/api/companies/[slug]` (s-maxage=3600, stale-while-revalidate=86400)**: Individual company statistics change infrequently. We cache this data for 1 hour at the edge and allow stale revalidation in the background for up to 24 hours, maximizing user response latency gains and minimizing database connection overhead.

### 5. Next.js 16 Selection (Option B Rationale)
The project utilizes Next.js 16.2.9 and React 19.2.4 to leverage the latest React 19 Server Components, compiler performance enhancements, and modern routing optimizations. Moving back to older versions would risk runtime compatibility issues with other third-party dependencies and package-lock states. We document this version choice in accordance with the trial guidelines.

### 6. Dual-Taxonomy Source Enum Strategy
To guarantee database integrity and prevent data corruption, historical source keys (`ANONYMOUS_USER`, `OFFER_LETTER`, `VERIFIED_EMAIL`) are fully retained in the Prisma schema. The new specification-compliant source values (`CONTRIBUTOR`, `SCRAPED`, `AI_INFERRED`) are appended to the enum. This supports legacy entries and handles new submissions securely.

### 7. Level Mapping & Conversion Logic
Database enum values remain standard snake_case to match database norms:
* `SDE_I`
* `SDE_II`
* `SDE_III`

The presentation layer converts them dynamically to:
* `SDE-I`
* `SDE-II`
* `SDE-III`
to match the specification display requirements. This conversion is handled dynamically in the presentation tier inside:
* `LevelBadge` component ([badge.tsx](file:///C:/Users/R.Murugesan/OneDrive/Desktop/talentdash/src/components/ui/badge.tsx))
* `LevelDistributionBar` component ([level-distribution-bar.tsx](file:///C:/Users/R.Murugesan/OneDrive/Desktop/talentdash/src/components/features/level-distribution-bar.tsx))
* `SalaryTable` component ([salary-table.tsx](file:///C:/Users/R.Murugesan/OneDrive/Desktop/talentdash/src/components/features/salary-table.tsx))
using `.replace('_', '-')`.

### 8. AI & Data Engineering Out-of-Scope Status
As a candidate on the Full-Stack Developer track, all Python-based pipeline elements (e.g., parsing PDF offer letters via OCR, LLM extraction pipelines) are excluded from the runtime codebase. Instead, the ingestion layer (`POST /api/ingest-salary`) exposes a fully validated REST endpoint that accepts parsed JSON payloads directly, mockable with AI-inferred values.

---

## 🚀 Deployment & Local Setup

### Setup and Replication Steps
1. **Clone and Install**:
   ```bash
   git clone https://github.com/kutty04/TalentDash.git
   cd TalentDash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_M2Go6ZewfcIL@ep-summer-sound-atd8m4g7-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. **Database Migration**:
   Mark baseline migration as applied, then deploy the compliance updates to your database:
   ```bash
   npx prisma generate
   node -r dotenv/config scratch/db-migrate.js resolve 20260617000001_init
   node -r dotenv/config scratch/db-migrate.js deploy 20260617000002_compliance_updates
   ```
4. **Seed Database**:
   Seed the database tables with standard and compliance mock records:
   ```bash
   npm run db:seed
   ```
5. **Run Test Suite**:
   Execute the automated unit tests:
   ```bash
   npm run test
   ```
6. **Start Dev Server**:
   Start the local development server:
   ```bash
   npm run dev
   ```

---

## 🛡️ Migration Safety Report

### 1. Migration Assets
* **Baseline Migration**: `20260617000001_init`
  * **SQL Script**: Creates the base schemas, tables (`Company`, `Salary`), indexes, and default enum labels.
* **Compliance Migration**: `20260617000002_compliance_updates`
  * **SQL Script**: Runs `ALTER TYPE` to append new enum labels (`L3`, `L4`, `L5`, `L6`, `IC4`, `IC5` to `Level`; `GBP`, `EUR` to `Currency`; `CONTRIBUTOR`, `SCRAPED`, `AI_INFERRED` to `Source`).

### 2. SQL Review Summary
The script was verified offline to ensure it executes only additions (`ALTER TYPE ... ADD VALUE`), guaranteeing no tables or columns are dropped or truncated. This ensures 100% data preservation.

### 3. Execution Record
* **Staging Validation**:
  * Action: Clean database $\rightarrow$ Apply baseline SQL $\rightarrow$ Run `db-migrate.js resolve 20260617000001_init` $\rightarrow$ Run `db-migrate.js deploy 20260617000002_compliance_updates`.
  * Result: **Success**. Checksum calculated and logged in `_prisma_migrations`.
* **Production Deployment**:
  * Action: Run `db-migrate.js resolve 20260617000001_init` $\rightarrow$ Run `db-migrate.js deploy 20260617000002_compliance_updates`.
  * Result: **Success**. Duplicate enum labels already present (e.g., `L4`, `L5`, `L6`, `IC4`, `IC5`, `EUR`, `SCRAPED`, `AI_INFERRED`) were safely skipped (Postgres code `42710`), while missing labels (`L3`, `GBP`, `CONTRIBUTOR`) were successfully created.

### 4. Production Impact Assessment
* **Uptime**: Zero downtime. Schema migrations only add enums which do not lock tables.
* **Data Integrity**: 100% data preservation. No existing records were modified or dropped.

### 5. Rollback Strategy
If a rollback is required:
1. Revert schema to `prisma/old_schema.prisma`.
2. Connect to the database and run rollback script to drop enums or resolve migration to a clean status. Note that Postgres does not support deleting enum values directly without rebuilding the type, so rollback would involve reverting the layer while leaving additional enum values dormant in the DB (which is completely safe).

---

## 🔮 Future Improvements

1. **Exchange Rate Integration**: Dynamically query live API rates to replace the hardcoded conversion multiplier.
2. **Global Full-Text Search**: Integrate Typesense or Meilisearch to support fuzzy autocomplete search as database volumes scale.
