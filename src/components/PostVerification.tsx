import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle2, FileText, RefreshCw } from 'lucide-react';

interface PostVerificationProps {
  onReset: () => void;
  onOpenAudit: () => void;
  presetId?: string;
}

export const PostVerification: React.FC<PostVerificationProps> = ({
  onReset,
  onOpenAudit,
  presetId = 'alex-finance-offboard'
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      
    }
  }, []);

  const getVerificationItems = () => {
    if (presetId === 'jordan-devops-revoke') {
      return [
        {
          id: 'v-1',
          title: 'Target User Offboarding',
          detail: 'Jordan Tech directory account marked deprovisioned across K8s CA & IAM.',
          status: 'Passed'
        },
        {
          id: 'v-2',
          title: 'Kubernetes Cluster Authority',
          detail: 'k8s-prod-us-east authority rotated to Vault Service Principal. Zero deployment interruptions.',
          status: 'Passed'
        },
        {
          id: 'v-3',
          title: 'Terraform State Lock Ownership',
          detail: 'DynamoDB tf-state-lock-prod lock lease assigned to Maya Lin. Infrastructure pipeline active.',
          status: 'Passed'
        },
        {
          id: 'v-4',
          title: 'CI/CD Webhook Bearer Auth',
          detail: 'GitHub Actions deploy hook authenticated via bot-deploy-ci service user.',
          status: 'Passed'
        },
        {
          id: 'v-5',
          title: 'PagerDuty Escalation Schedule',
          detail: 'Tier-1 primary on-call rotation re-routed to Maya Lin. Incident escalation tree intact.',
          status: 'Passed'
        }
      ];
    }

    if (presetId === 'db-cluster-delete') {
      return [
        {
          id: 'v-1',
          title: 'Read Replica Decommission',
          detail: 'db-prod-replica-02 cluster safely terminated after 0 active connection pools confirmed.',
          status: 'Passed'
        },
        {
          id: 'v-2',
          title: 'ETL Pipeline Routing',
          detail: 'Cron ETL connection endpoint re-routed to failover replica db-prod-replica-03.',
          status: 'Passed'
        },
        {
          id: 'v-3',
          title: 'Executive Dashboard Analytics',
          detail: 'JDBC connection pool updated to Primary DB Master. Zero 504 timeouts detected.',
          status: 'Passed'
        },
        {
          id: 'v-4',
          title: 'Billing Read Service',
          detail: 'Invoice lookup queries servicing via db-prod-replica-03 pool with 12ms average latency.',
          status: 'Passed'
        },
        {
          id: 'v-5',
          title: 'Database WAL Snapshot Storage',
          detail: 'Final WAL log snapshot successfully archived to S3 bucket db-wal-backups-2026.',
          status: 'Passed'
        }
      ];
    }

    return [
      {
        id: 'v-1',
        title: 'Target User Offboarding',
        detail: 'Alex Morgan directory account marked deprovisioned across SSO & IAM.',
        status: 'Passed'
      },
      {
        id: 'v-2',
        title: 'PO Approval Workflow Integrity',
        detail: 'Tier-2 Purchase Order workflow verified active with Elena Rostova as active signatory.',
        status: 'Passed'
      },
      {
        id: 'v-3',
        title: 'AWS S3 Vault KMS Key Custody',
        detail: 'Vault finance-audit-vault-2026 KMS encryption key policy verified accessible to Elena Rostova.',
        status: 'Passed'
      },
      {
        id: 'v-4',
        title: 'Daily Payroll Sync Bot Auth',
        detail: 'Cron bearer token handshaking verified HTTP 200 OK using service account.',
        status: 'Passed'
      },
      {
        id: 'v-5',
        title: 'Stripe Billing Governance',
        detail: 'Stripe Master Admin seat granted to Elena Rostova. Governance seat operational.',
        status: 'Passed'
      }
    ];
  };

  const verificationItems = getVerificationItems();

  return (
    <div className="bg-[#131823] border border-emerald-900/50 rounded-lg p-5 mb-6">
      {}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Post-Execution Health Verification
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Post-flight integrity checks confirm zero system degradation following execution.
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-900/40">
          All Verification Checks Passed
        </span>
      </div>

      {}
      <div className="space-y-2 mb-5">
        {verificationItems.map((item) => (
          <div 
            key={item.id}
            className="p-3 rounded-md border border-slate-800 bg-[#0B0E14] flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-xs">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40 shrink-0">
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          View Audit Log Record
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Simulate Another Action
        </button>
      </div>
    </div>
  );
};
