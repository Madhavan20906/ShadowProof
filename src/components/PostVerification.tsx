import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle2, FileText, RefreshCw, Award, ArrowRight } from 'lucide-react';

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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Graceful fallback if canvas confetti unavailable
    }
  }, []);

  const getVerificationItems = () => {
    if (presetId === 'jordan-devops-revoke') {
      return [
        {
          id: 'v-1',
          title: 'Target Employee Offboarding',
          detail: 'Jordan Tech directory account marked DEPROVISIONED across K8s CA & IAM.',
          status: 'PASSED'
        },
        {
          id: 'v-2',
          title: 'Kubernetes Cluster Authority',
          detail: 'k8s-prod-us-east cluster admin authority rotated to Vault Service Principal. Zero deployment interruptions.',
          status: 'PASSED'
        },
        {
          id: 'v-3',
          title: 'Terraform State Lock Ownership',
          detail: 'DynamoDB tf-state-lock-prod lock lease assigned to Maya Lin. Infrastructure pipeline active.',
          status: 'PASSED'
        },
        {
          id: 'v-4',
          title: 'CI/CD Webhook Bearer Auth',
          detail: 'GitHub Actions deploy hook authenticated via bot-deploy-ci service user. HTTP 200 OK verified.',
          status: 'PASSED'
        },
        {
          id: 'v-5',
          title: 'PagerDuty Escalation Schedule',
          detail: 'Tier-1 primary on-call rotation re-routed to Maya Lin. Incident escalation tree verified intact.',
          status: 'PASSED'
        }
      ];
    }

    if (presetId === 'db-cluster-delete') {
      return [
        {
          id: 'v-1',
          title: 'Target Read Replica Decommission',
          detail: 'db-prod-replica-02 cluster safely terminated after 0 active connection pools confirmed.',
          status: 'PASSED'
        },
        {
          id: 'v-2',
          title: 'Nightly Analytics ETL Pipeline',
          detail: 'Cron #cron-etl connection endpoint re-routed to failover replica db-prod-replica-03. HTTP 200 OK.',
          status: 'PASSED'
        },
        {
          id: 'v-3',
          title: 'Tableau Executive Dashboard',
          detail: 'JDBC connection pool updated to Primary DB Master. Zero 504 timeouts detected.',
          status: 'PASSED'
        },
        {
          id: 'v-4',
          title: 'Customer Billing Read Service',
          detail: 'Invoice lookup queries servicing via db-prod-replica-03 pool with 12ms average latency.',
          status: 'PASSED'
        },
        {
          id: 'v-5',
          title: 'Database WAL Snapshot Cold Storage',
          detail: 'Final WAL log snapshot successfully archived to S3 bucket db-wal-backups-2026.',
          status: 'PASSED'
        }
      ];
    }

    return [
      {
        id: 'v-1',
        title: 'Target Employee Offboarding',
        detail: 'Alex Morgan directory account marked DEPROVISIONED across SSO & IAM.',
        status: 'PASSED'
      },
      {
        id: 'v-2',
        title: 'PO Approval Workflow Integrity',
        detail: 'Tier-2 Purchase Order workflow verified ACTIVE with Elena Rostova as active signatory. $142,000 pending POs unblocked.',
        status: 'PASSED'
      },
      {
        id: 'v-3',
        title: 'AWS S3 Vault KMS Key Custody',
        detail: 'Vault finance-audit-vault-2026 KMS encryption key policy verified accessible to Elena Rostova. Zero compliance flags.',
        status: 'PASSED'
      },
      {
        id: 'v-4',
        title: 'Daily Payroll Sync Bot Auth',
        detail: 'Cron #8821 bearer token handshaking verified HTTP 200 OK using service account svc_payroll_automation.',
        status: 'PASSED'
      },
      {
        id: 'v-5',
        title: 'Stripe Billing Governance',
        detail: 'Stripe Master Admin seat granted to Elena Rostova. Secondary governance seat operational.',
        status: 'PASSED'
      }
    ];
  };

  const verificationItems = getVerificationItems();

  return (
    <div className="glass-panel p-6 mb-6 border-emerald-500/50 bg-gradient-to-br from-emerald-950/20 via-slate-900/90 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              POST-EXECUTION HEALTH VERIFICATION
            </h3>
            <span className="cyber-badge badge-emerald">STEP 13 & 14 COMPLETE</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Automated post-flight integrity scan confirms zero system degradation.
          </p>
        </div>

        <span className="cyber-badge badge-cyan text-xs">100% HEALTHY</span>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 mb-6">
        {verificationItems.map((item) => (
          <div 
            key={item.id}
            className="p-3.5 rounded-xl border border-emerald-500/30 bg-slate-900/80 flex items-start justify-between gap-3 font-mono text-xs"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white font-sans text-xs">{item.title}</h4>
                <p className="text-[11px] text-slate-300 font-sans">{item.detail}</p>
              </div>
            </div>
            <span className="cyber-badge badge-emerald shrink-0">
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          View Immutable Audit Record
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Simulate Another Action
        </button>
      </div>
    </div>
  );
};
