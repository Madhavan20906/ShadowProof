# 🛡️ ShadowProof — Pre-Execution Safety Rehearsal Engine

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge&logo=vite)](https://github.com/Madhavan20906/ShadowProof)
[![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **"Don't let your production environment be your testing ground."**

**ShadowProof** is an enterprise-grade **pre-execution counterfactual rehearsal engine**. Before any destructive operational mutation (SSO offboarding, cloud resource deletion, database teardown, or API token revocation) touches a real system, ShadowProof clones the topology graph, simulates multi-hop failure cascades, evaluates compliance invariants, and synthesizes a non-destructive **Plan B (Rehearsed Execution)** alternative in real-time.

---

## 💥 The Core Problem: Invisible Downstream Cascades

When SREs, IT Administrators, or Security Operations execute routine operational changes:
- ❌ **Frozen Approval Chains**: Deprovisioning a finance analyst halts $140K+ purchase order approvals because they were the sole active signatory.
- ❌ **Orphaned KMS Vaults**: Deleting a key custodian revokes access policies to production S3 KMS encryption keys.
- ❌ **Crashed Data Automations**: Revoking personal access tokens (PATs) causes daily payroll sync bots to crash with `HTTP 401 Unauthorized`.
- ❌ **Dangling Database Replicas**: Dropping a database replica breaks BI dashboards and downstream ETL pipelines.

---

## ⚡ The Solution: Shadow Rehearsal Architecture

ShadowProof intercepts operational intents and runs a **7-stage safety rehearsal pipeline**:

```mermaid
flowchart TD
    A[Operational Intent / Command Input] --> B[Gemini AI Intent & Constraint Parser]
    B -->|Target Node & Rules| C[System Graph State Cloning]
    
    subgraph Isolated Shadow Rehearsal Environment
        C --> D[Plan A: Direct Mutation Engine]
        D --> E[Multi-Hop Graph Cascade Traversal]
        E --> F{Invariant Policy Evaluator}
        
        F -->|Violations Detected| G[Goal-Preserving State Search Engine]
        G -->|Auto-Reroute & Transfer| H[Plan B: Rehearsed Execution Model]
    end
    
    H --> I[Counterfactual Evidence Matrix & Risk Scoring]
    I --> J[Human Approval & Governance Gate]
    J -->|Approved| K[Controlled Sandbox Execution Console]
    K --> L[Immutable Hash Audit Trail & JSON Verification]
```

---

## ✨ Key Features & Capabilities

| Feature | Description |
| :--- | :--- |
| **Comparative Simulation Engine** | Dynamic computation of Risk Scores (0-100), blast radius depth, and breaking consequences for both **Plan A (Direct)** and **Plan B (Rehearsed)**. |
| **Multi-Model Gemini AI Integration** | Google Gemini API integration (`gemini-2.5-flash` / `gemini-2.0-flash` / `gemini-1.5-flash`) with dynamic model discovery, cached model resolution, and zero-downtime offline deterministic fallback. |
| **Policy Invariant Guardrails** | Enforces 5 strict system invariants (`INV-01` through `INV-05`) verifying approval signatories, KMS key custody, automation principal auth, master governance seats, and database connection pools. |
| **Interactive Topology Visualizer** | Full SVG dependency graph visualization with node drag-and-drop, topological auto-layout, search/filtering, and interactive blast radius heatmaps. |
| **Temporal Consequence Breakdown** | Detailed impact timeline forecasting downstream failures at `T+0s`, `T+5m`, `T+1h`, and `T+24h`. |
| **Custom Scenario Importer/Exporter** | Built-in scenario manager supporting custom JSON snapshot import/export and active entity graph editing. |
| **Controlled Sandbox Console** | Real-time synthetic terminal emulator demonstrating zero-outage execution with live log streaming. |
| **Immutable Compliance Audit Trail** | SHA-256 snapshot hashing, digital approval signatures, verification checklists, and downloadable compliance audit logs. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend & UI**: React 18, TypeScript, TailwindCSS, Lucide Icons, Vite
- **Graph & Topology Engine**: Custom graph traversal algorithms (`genericPlanner.ts`, `genericSimulationEngine.ts`)
- **Generative AI Engine**: Google Gemini REST API with zero-overhead model caching and rate limit short-circuit protection
- **Testing & Tooling**: Vitest, PostCSS, ESLint

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Madhavan20906/ShadowProof.git
cd ShadowProof

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API Key
# If omitted, the engine automatically runs in deterministic offline mode!
cp .env.example .env
# Set VITE_GEMINI_API_KEY="your-google-gemini-api-key"

# 4. Launch local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running Tests & Production Build

```bash
# Run unit tests
npm test

# Build production bundle
npm run build
```

---

## 📁 Repository Structure

```
shadowproof/
├── src/
│   ├── components/            # React UI Components
│   │   ├── AIRiskCard.tsx       # AI Risk Reasoning Card
│   │   ├── DependencyGraph.tsx  # Interactive SVG Graph Visualizer
│   │   ├── EvidenceMatrix.tsx   # Side-by-side Plan A vs Plan B Evidence Matrix
│   │   ├── Header.tsx           # Global Header & Engine Status
│   │   ├── IntentInput.tsx      # Natural Language Command Input
│   │   ├── PolicyCheckPanel.tsx # Invariant Check Verification Panel
│   │   └── ...
│   ├── engine/                # Core Simulation & AI Engines
│   │   ├── aiReasoningEngine.ts # Gemini LLM Safety Synthesis Engine
│   │   ├── intentParser.ts      # Gemini Natural Language Intent Parser
│   │   ├── genericPlanner.ts    # Comparative Plan Generator & State Search
│   │   ├── genericSimulationEngine.ts # Multi-hop Graph Traversal & Invariants
│   │   └── shadowEngine.ts      # Legacy Scenario Engine Wrappers
│   ├── mock/                  # Preset Scenarios & Initial State Topology
│   └── types/                 # TypeScript Interfaces & Systems Models
├── dist/                      # Production Build Distribution
├── vercel.json                # Vercel Deployment Configuration
├── netlify.toml               # Netlify Deployment Configuration
└── README.md                  # System Documentation
```

---

## 🔒 Security & Privacy Controls

- **Zero Middleware Key Storage**: Your Google Gemini API key is kept locally in browser `localStorage` / environment variables. It travels directly via HTTPS to Google's official endpoints (`generativelanguage.googleapis.com`).
- **100% Type-Safe Contracts**: All graph state mutations, action plans, and LLM payloads are strictly bound to TypeScript types with zero `: any` type bypasses.
- **TOCTOU Snapshot Hashing**: State snapshot topology hashes (`STATE-XXXXXXXX`) detect race conditions before controlled execution.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
