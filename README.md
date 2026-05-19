Here’s a cleaner, more professional README you can paste directly into `README.md`. I based it on the live positioning from `bidlevel.xyz`, which describes Bid Level as a browser-based IFC takeoff tool with click-to-verify, revision diff, bid-ready exports, CSI grouping, and WebGL rendering. ([Bid Level][1])

````md
# Bid Level

**IFC takeoff in your browser. No Revit. No Navisworks. No install.**

[bidlevel.xyz](https://bidlevel.xyz)

Bid Level is a browser-based BIM takeoff platform built for estimators, preconstruction teams, and SMB contractors who need fast, verifiable quantity takeoffs from IFC models without relying on heavyweight desktop software.

Upload an IFC model, generate a bid-ready quantity schedule, click any line item to verify exactly which elements were counted, and compare model revisions before margin erosion turns into a real cost problem.

---

## What Bid Level Does

Bid Level helps contractors turn BIM files into usable estimating data.

Instead of manually digging through models or relying on black-box exports, Bid Level gives estimators a fast, visual workflow:

1. Upload an IFC model
2. Generate quantity takeoffs in the browser
3. Group results by CSI MasterFormat
4. Click a line item to highlight the counted model elements
5. Export bid-ready files for estimating workflows
6. Compare revisions to understand cost-impact changes

---

## Core Features

### 60-Second IFC Takeoffs

Drop in an IFC file and generate a structured quantity schedule directly in the browser.

### Click-to-Verify Quantities

Select any takeoff line item and see the exact model elements included in that quantity. This makes the takeoff easier to audit, explain, and trust.

### Revision Diff

Compare updated IFC files against prior versions to identify quantity changes, cost-impact deltas, and scope shifts before they affect the bid.

### Bid-Ready Exports

Export takeoff data to formats estimators already use, including CSV, Excel, and future PDF reporting.

### Pure Browser Workflow

No Revit license.  
No Navisworks install.  
No heavy desktop setup.  

Bid Level is designed to work from the laptop contractors already use.

### CSI-Native Organization

Takeoff results are grouped around CSI MasterFormat-style divisions so estimates are easier to organize, review, and hand off.

---

## Target Users

Bid Level is built for:

- Estimators
- Chief estimators
- Project managers
- Preconstruction teams
- General contractors
- Trade contractors
- SMB construction firms
- Contractors receiving IFC/BIM files but lacking expensive model-review software

---

## Why It Matters

Many contractors receive BIM files but still struggle to turn those files into fast, trustworthy estimating data.

Traditional workflows often require:

- Expensive software licenses
- Installed desktop applications
- Manual model review
- Static quantity reports
- Limited visibility into what was actually counted
- Time-consuming revision comparisons

Bid Level is designed to make BIM takeoff faster, more transparent, and easier to use for the contractors who do not have a full VDC department.

---

## Current Product Positioning

> Drop a BIM model. Get a bid-ready takeoff in 60 seconds. Click any line item and see exactly which elements it counted. Compare revisions and catch margin erosion before it costs you.

---

## Tech Stack

This project is built with:

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Three.js](https://threejs.org)
- [React Three Fiber](https://r3f.docs.pmnd.rs)
- [Supabase](https://supabase.com)
- [Resend](https://resend.com)
- [Vercel Analytics](https://vercel.com/analytics)

---

## Supported Model / Takeoff Direction

Planned and/or active support includes:

- IFC 2x3
- IFC 4.0
- IFC 4.3
- IFC 5
- WebGL-based model rendering
- CSI MasterFormat-style grouping
- CSV export
- Excel export
- Revision comparison
- Project sharing
- Version history
- Branded exports

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/amlitio/bid-level.git
cd bid-level
````

### 2. Install Dependencies

This project uses `pnpm`.

```bash
pnpm install
```

You can also use npm, yarn, or bun if preferred.

```bash
npm install
```

### 3. Run the Development Server

```bash
pnpm dev
```

Then open:

```bash
http://localhost:3000
```

---

## Available Scripts

```bash
pnpm dev
```

Runs the local development server.

```bash
pnpm build
```

Builds the production application.

```bash
pnpm start
```

Starts the production build.

```bash
pnpm lint
```

Runs linting checks.

---

## Project Structure

```txt
bid-level/
├── public/              # Static assets
├── src/
│   └── app/             # Next.js app router pages and components
├── next.config.ts       # Next.js configuration
├── package.json         # Project scripts and dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md
```

---

## Roadmap

### Near-Term

* Improve IFC parsing reliability
* Add stronger sample demo models
* Add polished export templates
* Improve estimator-facing takeoff tables
* Add clearer visual highlighting in the model viewer
* Capture and route waitlist submissions

### Product Expansion

* Authenticated user accounts
* Project dashboard
* Saved takeoff history
* Revision comparison workflow
* Team sharing
* Company-branded exports
* Pricing and subscription management
* Estimator notes and assumptions
* AI-assisted quantity review
* Bid package summaries

### Future Vision

Bid Level can become a lightweight BIM-to-bid operating layer for SMB contractors — helping teams move from model files to verified quantities, cost impacts, and bid-ready outputs without requiring enterprise VDC infrastructure.

---

## Pricing Direction

The current product direction includes:

### Free

For basic takeoff access and CSV export.

### Solo

For individual estimators who need unlimited projects, larger files, revision diff, and full exports.

### Team

For contractor teams that need project sharing, version history, branded exports, and larger file support.

---

## Deployment

The application is designed to deploy on [Vercel](https://vercel.com).

```bash
pnpm build
```

Then deploy through Vercel using the connected GitHub repository.

---

## Environment Variables

Create a `.env.local` file for local development.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Adjust environment variables as the backend, waitlist, auth, and storage workflows evolve.

---

## Contact

Website: [https://bidlevel.xyz](https://bidlevel.xyz)
Email: [hello@bidlevel.app](mailto:hello@bidlevel.app)

---

## Status

Bid Level is currently in early product development / beta positioning.

The goal is to validate demand with estimators and contractors, improve the IFC takeoff workflow, and build toward a practical browser-based estimating tool for construction teams.

```

The current GitHub README is still the default Next.js boilerplate, so replacing it with this will make the repo look much more like a real product instead of a starter app.
::contentReference[oaicite:1]{index=1}
```

[1]: https://bidlevel.xyz/ "Bid Level — IFC takeoff in your browser"
