# 🛡️ SHADOWPROOF
> **"Don't let the real system be your testing environment."**

ShadowProof is a **pre-execution counterfactual simulation and action planning engine** designed to prevent catastrophic operational outages caused by routine IT administrative changes, employee offboarding, and cloud infrastructure modifications.

---

## 🎯 The Problem

When IT administrators execute operational commands—such as revoking an employee's SSO access, deprovisioning a contractor, or deleting a cloud resource—they often operate blind to hidden downstream dependencies:
- **Stalled Approval Workflows**: Deleting an analyst freezes purchase order sign-offs exceeding $140,000 because they were the sole active signatory.
- **Orphaned Encryption Vaults**: Deprovisioning a key custodian locks out KMS access policies on production S3 buckets.
- **Crashed Automations**: Revoking personal access tokens (PATs) terminates scheduled background cron jobs with `HTTP 401 Unauthorized`.
- **Dangling Endpoints**: Deleting a database read-replica breaks ETL data pipelines and executive reporting dashboards.

---

## 💡 The Solution: Shadow Rehearsal Architecture

ShadowProof introduces a **pre-execution rehearsal pipeline**. Before any mutation touches the real workspace, ShadowProof:
1. **Clones the System State Graph** into an isolated shadow environment.
2. **Executes Action Mutators** against the shadow copy, traversing multi-hop dependency links.
3. **Evaluates Behavioral Invariants**:
   - `INV-01`: Approval Workflow Signatory Requirement ($\ge 1$ active approver).
   - `INV-02`: KMS Key Custody & Access Policy (Non-vacant owner).
   - `INV-03`: Production Automation Authentication (Managed Service Principal required).
   - `INV-04`: Master Governance Seat Redundancy.
   - `INV-05`: Database Connection Pool Endpoint Verification.
4. **Synthesizes a Safer Alternative (Plan B)**: Automatically searches for active domain leads, rotates bot PATs to service accounts, re-assigns sign-off authority, and re-routes connection endpoints before deprovisioning the target.
5. **Calculates Evidence-Backed Uncertainty & Blast Radius**: Provides side-by-side counterfactual metrics (Direct Plan A vs Rehearsed Plan B).
6. **Requires Human Gatekeeper Approval**: Enforces authorization before executing the safer action plan inside a controlled sandbox environment.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    User([User / Operator Command]) --> IntentParser[Intent & Constraint Parser]
    IntentParser -->|Parsed Target & Constraints| ShadowEngine[Generic Simulation Engine]
    
    subgraph Isolated Shadow Environment
        RealState[(Real State Graph)] -. Clone .-> ShadowState[(Shadow State Clone)]
        ShadowState --> Mutate[Direct Mutation Engine]
        Mutate --> Cascade[Dependency Graph Traversal]
        Cascade --> Invariants{Invariant Check Rules}
        Invariants -->|Violations Found| PlanSearch[Goal-Preserving Candidate Search]
        PlanSearch -->|Remediations Applied| ReSimulate[Plan B Re-Simulation]
    end
    
    ReSimulate --> Evidence[Evidence & Counterfactual Comparison]
    Evidence --> BlastRadius[Blast Radius & Risk Heatmap]
    BlastRadius --> HumanGate{Human Authorization Gate}
    HumanGate -->|Approved| ControlledExec[Controlled Sandbox Execution]
    ControlledExec --> AuditLog[(Immutable Audit Log & Persistence)]
```

---

## 🤖 Transparent AI & Engine Disclosure

ShadowProof uses a **hybrid architecture** combining generative AI with deterministic graph safety models:

- **AI-Assisted Components (Groq Llama 3.3 70B)**:
  - Natural-language intent parsing & target node extraction.
  - Natural-language operational constraint detection.
  - Plain-language risk explanation generation.
- **Deterministic System Engine**:
  - Graph state cloning & link severing/re-routing.
  - Multi-hop cascade propagation.
  - System invariant verification (`INV-01` through `INV-05`).
  - Evidence provenance & root-cause chain tracing.
  - Snapshot hash calculation & TOCTOU verification.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/enterprise/shadowproof.git
cd shadowproof

# Install dependencies
npm install

# (Optional) Set Groq API Key for live LLM parsing
# If omitted, system seamlessly defaults to built-in deterministic graph parsing.
export VITE_GROQ_API_KEY="gsk_..."

# Start local development server
npm run dev
```

---

## 📸 Key Features & Demo Surfaces

1. **Preset & Custom Scenario Engine**: Seeded scenarios for Employee Offboarding, DevOps Access Revocation, Database Cluster Teardown, and Contractor Offboarding. Includes a full **JSON Snapshot Importer/Exporter** and interactive graph entity builder.
2. **Side-by-Side Counterfactual Comparison**: Direct Plan A (High Risk, Breaking Failures) vs Rehearsed Plan B (0 Failures, Low Risk).
3. **Temporal Timeline Breakdown**: Cascading outage breakdown across `T+0s`, `T+5m`, `T+1h`, and `T+24h`.
4. **Controlled Workspace Execution**: Honest terminal visualization showing execution in a controlled synthetic workspace sandbox.
5. **Immutable Compliance Audit Trail**: Full event history with snapshot hashes, verification checklists, and JSON report export.

---

## 🛡️ Responsible Delivery & Security Controls

- **Prompt Injection Defense**: All natural-language inputs are parsed into strictly typed JSON schemas with action allowlisting (`deprovision`, `reassign_approver`, `transfer_ownership`, `rotate_credential`, `update_permission`).
- **TOCTOU Precondition Verification**: Compares snapshot hashes (`STATE-XXXX`) prior to execution to detect stale state changes.
- **Honest System Boundaries**: Clear visual labeling indicating **"SHADOW ENVIRONMENT — NO REAL CHANGES"** and **"CONTROLLED WORKSPACE EXECUTION (Synthetic Environment)"**.

---

## 📄 License
MIT License. Built for the Hackathon Demonstration.
