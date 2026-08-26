import { SystemState, PresetScenario } from '../types/shadowproof';

export const INITIAL_ALEX_STATE: SystemState = {
  name: "Enterprise Core IT Infrastructure State",
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "user-alex",
      name: "Alex Morgan",
      type: "user",
      description: "Senior Financial Analyst & Admin Delegate",
      status: "active",
      meta: {
        email: "alex.m@enterprise.io",
        roleName: "Sr Financial Analyst",
        team: "Finance",
        lastActive: "2 mins ago",
        mfaStatus: "Enforced"
      },
      x: 100,
      y: 240
    },
    {
      id: "user-elena",
      name: "Elena Rostova",
      type: "user",
      description: "Finance Director & Team Manager",
      status: "active",
      meta: {
        email: "elena.r@enterprise.io",
        roleName: "Finance Director",
        team: "Finance",
        lastActive: "15 mins ago",
        mfaStatus: "Enforced"
      },
      x: 100,
      y: 80
    },
    {
      id: "user-svc-payroll",
      name: "svc_payroll_automation",
      type: "user",
      description: "Dedicated Service Account for Automated Payroll Sync",
      status: "active",
      meta: {
        email: "svc.payroll@enterprise.internal",
        roleName: "Bot Service Principal",
        team: "Ops Automation",
        mfaStatus: "Managed Key"
      },
      x: 100,
      y: 400
    },
    {
      id: "team-finance",
      name: "Finance Team",
      type: "team",
      description: "Core Corporate Finance & Accounting Org",
      status: "active",
      meta: {
        memberCount: 8,
        budgetCode: "FIN-2026-HQ"
      },
      x: 320,
      y: 160
    },
    {
      id: "cred-alex-pat",
      name: "AM_PAT_99182 (Personal Access Token)",
      type: "credential",
      description: "Personal API token created by Alex Morgan",
      status: "active",
      meta: {
        expiresInDays: 140,
        scope: "payroll:write, employees:read",
        issuedTo: "Alex Morgan"
      },
      x: 320,
      y: 360
    },
    {
      id: "workflow-po-approval",
      name: "Tier-2 Purchase Order Approval",
      type: "workflow",
      description: "Mandatory sign-off workflow for POs exceeding $50,000",
      status: "active",
      meta: {
        monetaryValue: "$142,000 pending across 14 POs",
        sigCount: 1,
        slaHours: 24
      },
      x: 580,
      y: 80
    },
    {
      id: "resource-s3-vault",
      name: "AWS S3: finance-audit-vault-2026",
      type: "resource",
      description: "Encrypted S3 Bucket holding Q1 Audit Logs & Tax filings",
      status: "active",
      meta: {
        kmsKeyId: "arn:aws:kms:us-east-1:99120412:key/fin-vault-2026",
        owner: "Alex Morgan",
        storageGb: 840
      },
      x: 580,
      y: 240
    },
    {
      id: "automation-payroll-bot",
      name: "Daily Payroll Sync Bot (Cron #8821)",
      type: "automation",
      description: "Automated daily sync between HR portal & payroll vendor",
      status: "active",
      meta: {
        schedule: "Daily at 06:00 UTC",
        impactedEmployees: 120,
        vendor: "Gusto API"
      },
      x: 580,
      y: 380
    },
    {
      id: "role-stripe-admin",
      name: "Stripe Billing Master Admin",
      type: "role",
      description: "Super Admin privileges on Enterprise Stripe Dashboard",
      status: "active",
      meta: {
        mfaRequired: true,
        grantedBy: "Board Governance"
      },
      x: 320,
      y: 40
    }
  ],
  links: [
    {
      id: "l-alex-team",
      source: "user-alex",
      target: "team-finance",
      type: "belongs_to",
      description: "Member of Finance Team",
      status: "healthy"
    },
    {
      id: "l-elena-team",
      source: "user-elena",
      target: "team-finance",
      type: "belongs_to",
      description: "Manager of Finance Team",
      status: "healthy"
    },
    {
      id: "l-alex-po",
      source: "user-alex",
      target: "workflow-po-approval",
      type: "approves",
      description: "Sole Tier-2 Designated Approver",
      status: "healthy"
    },
    {
      id: "l-alex-s3",
      source: "user-alex",
      target: "resource-s3-vault",
      type: "owns",
      description: "Primary KMS Key Custodian & Bucket Owner",
      status: "healthy"
    },
    {
      id: "l-alex-pat",
      source: "user-alex",
      target: "cred-alex-pat",
      type: "owns",
      description: "Token Owner & Creator",
      status: "healthy"
    },
    {
      id: "l-pat-payroll",
      source: "cred-alex-pat",
      target: "automation-payroll-bot",
      type: "authenticates_with",
      description: "Bearer Token Authentication for API calls",
      status: "healthy"
    },
    {
      id: "l-alex-stripe",
      source: "user-alex",
      target: "role-stripe-admin",
      type: "owns",
      description: "Master Admin Seat",
      status: "healthy"
    }
  ]
};

export const INITIAL_JORDAN_STATE: SystemState = {
  name: "DevOps & Cloud Infrastructure Topology",
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "user-jordan",
      name: "Jordan Tech",
      type: "user",
      description: "Lead DevOps Engineer & K8s Admin",
      status: "active",
      meta: {
        email: "jordan.t@enterprise.io",
        roleName: "Lead DevOps Engineer",
        team: "Platform Infra",
        lastActive: "1 min ago",
        mfaStatus: "Enforced (Hardware Key)"
      },
      x: 100,
      y: 240
    },
    {
      id: "user-maya",
      name: "Maya Lin",
      type: "user",
      description: "Sr. Site Reliability Lead",
      status: "active",
      meta: {
        email: "maya.l@enterprise.io",
        roleName: "Sr SRE Lead",
        team: "Platform Infra",
        lastActive: "10 mins ago",
        mfaStatus: "Enforced"
      },
      x: 100,
      y: 80
    },
    {
      id: "user-bot-deploy",
      name: "bot-deploy-ci",
      type: "user",
      description: "Service Account for CI/CD Deployment Automation",
      status: "active",
      meta: {
        email: "bot.deploy@enterprise.internal",
        roleName: "CI/CD Service Principal",
        team: "Platform Infra",
        mfaStatus: "Managed Key"
      },
      x: 100,
      y: 400
    },
    {
      id: "team-infra",
      name: "Platform Infra Team",
      type: "team",
      description: "Core Cloud Platform & Reliability Engineering",
      status: "active",
      meta: {
        memberCount: 6,
        budgetCode: "INFRA-2026-CLOUD"
      },
      x: 320,
      y: 160
    },
    {
      id: "cred-jordan-pat",
      name: "DEVOPS_KUBE_PAT_8801",
      type: "credential",
      description: "Kubernetes Cluster Access Token owned by Jordan Tech",
      status: "active",
      meta: {
        expiresInDays: 90,
        scope: "cluster-admin, deploy:write",
        issuedTo: "Jordan Tech"
      },
      x: 320,
      y: 360
    },
    {
      id: "workflow-k8s-admin",
      name: "K8s Prod Cluster (k8s-prod-us-east)",
      type: "workflow",
      description: "Production Kubernetes Cluster Deployment Authority",
      status: "active",
      meta: {
        nodes: 42,
        activeMicroservices: 38,
        slaHours: 99.99
      },
      x: 580,
      y: 80
    },
    {
      id: "resource-tf-state",
      name: "DynamoDB: tf-state-lock-prod",
      type: "resource",
      description: "Terraform Infrastructure Locks Table for Production State",
      status: "active",
      meta: {
        currentLockOwner: "Jordan Tech",
        leaseTime: "Active"
      },
      x: 580,
      y: 240
    },
    {
      id: "automation-cicd-webhook",
      name: "GitHub Actions Deploy Hook (#cron-deploy)",
      type: "automation",
      description: "Automated continuous deployment pipeline webhook",
      status: "active",
      meta: {
        repository: "enterprise/core-backend",
        vendor: "GitHub Actions API"
      },
      x: 580,
      y: 380
    },
    {
      id: "role-pagerduty-lead",
      name: "PagerDuty Tier-1 On-Call Lead",
      type: "role",
      description: "Primary incident manager for critical outage escalations",
      status: "active",
      meta: {
        shiftDuration: "24/7 Primary",
        grantedBy: "VP Engineering"
      },
      x: 320,
      y: 40
    }
  ],
  links: [
    {
      id: "l-jordan-team",
      source: "user-jordan",
      target: "team-infra",
      type: "belongs_to",
      description: "Lead Engineer of Infra Team",
      status: "healthy"
    },
    {
      id: "l-maya-team",
      source: "user-maya",
      target: "team-infra",
      type: "belongs_to",
      description: "SRE Lead of Infra Team",
      status: "healthy"
    },
    {
      id: "l-jordan-k8s",
      source: "user-jordan",
      target: "workflow-k8s-admin",
      type: "approves",
      description: "Sole Cluster Admin Certificate Signer",
      status: "healthy"
    },
    {
      id: "l-jordan-tf",
      source: "user-jordan",
      target: "resource-tf-state",
      type: "owns",
      description: "Primary State Lock Holder",
      status: "healthy"
    },
    {
      id: "l-jordan-pat",
      source: "user-jordan",
      target: "cred-jordan-pat",
      type: "owns",
      description: "Token Owner & Keyholder",
      status: "healthy"
    },
    {
      id: "l-pat-cicd",
      source: "cred-jordan-pat",
      target: "automation-cicd-webhook",
      type: "authenticates_with",
      description: "K8s Service Account Token",
      status: "healthy"
    },
    {
      id: "l-jordan-pd",
      source: "user-jordan",
      target: "role-pagerduty-lead",
      type: "owns",
      description: "Tier-1 Primary On-Call Rotation",
      status: "healthy"
    }
  ]
};

export const INITIAL_DB_STATE: SystemState = {
  name: "Production Database Cluster Topology",
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "resource-db-replica-2",
      name: "db-prod-replica-02",
      type: "resource",
      description: "Legacy Postgres Read Replica Cluster Target",
      status: "active",
      meta: {
        engine: "PostgreSQL 14.8",
        region: "us-east-1b",
        connections: "48 active pools"
      },
      x: 100,
      y: 240
    },
    {
      id: "resource-db-replica-3",
      name: "db-prod-replica-03",
      type: "resource",
      description: "Modern Secondary Failover Read Replica",
      status: "active",
      meta: {
        engine: "PostgreSQL 15.2",
        region: "us-east-1c",
        status: "Available"
      },
      x: 100,
      y: 80
    },
    {
      id: "service-primary-db",
      name: "db-prod-primary-master",
      type: "resource",
      description: "Primary Transactional Database Cluster Master",
      status: "active",
      meta: {
        engine: "PostgreSQL 15.2 Master",
        writeLatency: "< 2ms"
      },
      x: 100,
      y: 400
    },
    {
      id: "team-data-eng",
      name: "Data Engineering Team",
      type: "team",
      description: "BI & Data Platform Infrastructure Team",
      status: "active",
      meta: {
        memberCount: 5,
        budgetCode: "DATA-2026"
      },
      x: 320,
      y: 160
    },
    {
      id: "cred-db-read-pass",
      name: "DB_READONLY_SECRET_V2",
      type: "credential",
      description: "Database connection credential bound to replica-02 host",
      status: "active",
      meta: {
        targetHost: "db-prod-replica-02.internal",
        user: "etl_service_rw"
      },
      x: 320,
      y: 360
    },
    {
      id: "workflow-tableau-dash",
      name: "Tableau Executive Dashboard",
      type: "workflow",
      description: "Real-time executive financial reporting dashboard",
      status: "active",
      meta: {
        queryRate: "120 queries/min",
        impact: "Executive Board Visibility"
      },
      x: 580,
      y: 80
    },
    {
      id: "resource-wal-archiver",
      name: "AWS S3: db-wal-backups-2026",
      type: "resource",
      description: "S3 Bucket receiving WAL continuous replication logs",
      status: "active",
      meta: {
        streamSource: "db-prod-replica-02",
        retention: "30 Days"
      },
      x: 580,
      y: 240
    },
    {
      id: "automation-etl-cron",
      name: "Nightly Analytics ETL Pipeline (#cron-etl)",
      type: "automation",
      description: "Scheduled ETL sync feeding corporate data warehouse",
      status: "active",
      meta: {
        schedule: "Nightly at 02:00 UTC",
        rowsProcessed: "1.2M daily"
      },
      x: 580,
      y: 380
    },
    {
      id: "role-billing-query",
      name: "Customer Billing Read Service",
      type: "role",
      description: "Microservice resolving customer invoice histories",
      status: "active",
      meta: {
        apiEndpoint: "/v1/invoices/history",
        qps: 45
      },
      x: 320,
      y: 40
    }
  ],
  links: [
    {
      id: "l-db2-team",
      source: "resource-db-replica-2",
      target: "team-data-eng",
      type: "belongs_to",
      description: "Maintained by Data Eng",
      status: "healthy"
    },
    {
      id: "l-db3-team",
      source: "resource-db-replica-3",
      target: "team-data-eng",
      type: "belongs_to",
      description: "Maintained by Data Eng",
      status: "healthy"
    },
    {
      id: "l-db2-tableau",
      source: "resource-db-replica-2",
      target: "workflow-tableau-dash",
      type: "approves",
      description: "Primary Data Source Host",
      status: "healthy"
    },
    {
      id: "l-db2-wal",
      source: "resource-db-replica-2",
      target: "resource-wal-archiver",
      type: "owns",
      description: "Continuous WAL Stream Origin",
      status: "healthy"
    },
    {
      id: "l-db2-cred",
      source: "resource-db-replica-2",
      target: "cred-db-read-pass",
      type: "owns",
      description: "Host Endpoint Credential",
      status: "healthy"
    },
    {
      id: "l-cred-etl",
      source: "cred-db-read-pass",
      target: "automation-etl-cron",
      type: "authenticates_with",
      description: "Connection Pool Auth",
      status: "healthy"
    },
    {
      id: "l-db2-billing",
      source: "resource-db-replica-2",
      target: "role-billing-query",
      type: "owns",
      description: "Read Replica Query Target",
      status: "healthy"
    }
  ]
};

export const INITIAL_PRIYA_STATE: SystemState = {
  name: "Security & Contractor Credentials State",
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "user-priya",
      name: "Priya Shah",
      type: "user",
      description: "External Security Auditor & System Analyst",
      status: "active",
      meta: {
        email: "priya.s@consulting.enterprise.io",
        roleName: "Contractor Auditor",
        team: "Security Compliance",
        lastActive: "Just now",
        mfaStatus: "Enforced"
      },
      x: 100,
      y: 240
    },
    {
      id: "user-ravi",
      name: "Ravi Kumar",
      type: "user",
      description: "Staff Security Architect",
      status: "active",
      meta: {
        email: "ravi.k@enterprise.io",
        roleName: "Staff Security Architect",
        team: "Security Compliance"
      },
      x: 100,
      y: 80
    },
    {
      id: "team-sec-comp",
      name: "Security Compliance Team",
      type: "team",
      description: "Corporate Security & Regulatory Compliance Org",
      status: "active",
      meta: { memberCount: 5 },
      x: 320,
      y: 160
    },
    {
      id: "cred-priya-kms-key",
      name: "PRIYA_AUDIT_KMS_SIGNER",
      type: "credential",
      description: "Signing key for compliance reports & audit logs",
      status: "active",
      meta: { issuedTo: "Priya Shah" },
      x: 320,
      y: 360
    },
    {
      id: "workflow-sec-audit",
      name: "Quarterly SOC2 Compliance Signoff",
      type: "workflow",
      description: "Mandatory regulatory SOC2 compliance audit workflow",
      status: "active",
      meta: { sigCount: 1 },
      x: 580,
      y: 80
    },
    {
      id: "resource-gdrive-vault",
      name: "Google Drive: 2026-SecOps-Vault",
      type: "resource",
      description: "Encrypted Shared Google Drive Vault holding vulnerability disclosures",
      status: "active",
      meta: { owner: "Priya Shah" },
      x: 580,
      y: 240
    },
    {
      id: "automation-audit-bot",
      name: "Vulnerability Scanner Bot (#cron-sec)",
      type: "automation",
      description: "Automated vulnerability scanner publishing to SecOps vault",
      status: "active",
      meta: { schedule: "Daily at 00:00 UTC" },
      x: 580,
      y: 380
    }
  ],
  links: [
    {
      id: "l-priya-team",
      source: "user-priya",
      target: "team-sec-comp",
      type: "belongs_to",
      description: "Contractor Member",
      status: "healthy"
    },
    {
      id: "l-ravi-team",
      source: "user-ravi",
      target: "team-sec-comp",
      type: "belongs_to",
      description: "Staff Architect",
      status: "healthy"
    },
    {
      id: "l-priya-soc2",
      source: "user-priya",
      target: "workflow-sec-audit",
      type: "approves",
      description: "Sole Compliance Signatory",
      status: "healthy"
    },
    {
      id: "l-priya-gdrive",
      source: "user-priya",
      target: "resource-gdrive-vault",
      type: "owns",
      description: "Drive Vault Owner",
      status: "healthy"
    },
    {
      id: "l-priya-cred",
      source: "user-priya",
      target: "cred-priya-kms-key",
      type: "owns",
      description: "Audit Signing Key",
      status: "healthy"
    },
    {
      id: "l-cred-bot",
      source: "cred-priya-kms-key",
      target: "automation-audit-bot",
      type: "authenticates_with",
      description: "Scanner API Token",
      status: "healthy"
    }
  ]
};

export const INITIAL_REAL_SYSTEM_STATE: SystemState = INITIAL_ALEX_STATE;

export function getInitialStateForPreset(presetId: string): SystemState {
  switch (presetId) {
    case 'jordan-devops-revoke':
      return INITIAL_JORDAN_STATE;
    case 'db-cluster-delete':
      return INITIAL_DB_STATE;
    case 'priya-contractor-offboard':
      return INITIAL_PRIYA_STATE;
    case 'alex-finance-offboard':
    default:
      return INITIAL_ALEX_STATE;
  }
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "alex-finance-offboard",
    title: "Offboard Alex Morgan from Finance",
    prompt: "Remove Alex Morgan from the Finance team and revoke all associated system access.",
    description: "Primary IT Admin scenario: Employee connected to PO approval, owns KMS encrypted S3 vault, and provides PAT token to daily payroll automation.",
    targetUser: "Alex Morgan",
    iconName: "UserMinus",
    accentColor: "#F59E0B"
  },
  {
    id: "jordan-devops-revoke",
    title: "Revoke DevOps Access for Jordan Tech",
    prompt: "Revoke Lead DevOps permissions for Jordan Tech following contractor offboarding.",
    description: "Jordan owns Production Kubernetes cluster admin keys and automated CI/CD deployment pipeline webhooks.",
    targetUser: "Jordan Tech",
    iconName: "ShieldAlert",
    accentColor: "#EF4444"
  },
  {
    id: "db-cluster-delete",
    title: "Delete Legacy DB Cluster `db-prod-replica-02`",
    prompt: "Delete database cluster `db-prod-replica-02` to save cloud infrastructure costs.",
    description: "Database cluster is secretly referenced by 2 reporting microservices and an active nightly ETL data pipeline.",
    targetUser: "Database Admin",
    iconName: "Database",
    accentColor: "#8B5CF6"
  },
  {
    id: "priya-contractor-offboard",
    title: "Offboard Security Contractor Priya Shah",
    prompt: "Remove Priya Shah from Security Compliance and transfer all owned drive vaults.",
    description: "Contractor scenario: Priya holds SOC2 signoff authority, owns the SecOps drive vault, and provides key to vulnerability scanner bot.",
    targetUser: "Priya Shah",
    iconName: "UserX",
    accentColor: "#10B981"
  }
];

