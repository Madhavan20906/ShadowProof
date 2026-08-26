
export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'identity' | 'cloud_kms' | 'observability' | 'workflow';
  status: 'configured' | 'available' | 'simulated';
  supportedActions: string[];
  healthCheck: () => Promise<boolean>;
}

export const ENTERPRISE_CONNECTORS_REGISTRY: IntegrationConnector[] = [
  {
    id: 'conn-okta',
    name: 'Okta SCIM & Directory Connector',
    category: 'identity',
    status: 'simulated',
    supportedActions: ['deprovision_user', 'reassign_group_membership', 'revoke_sso_tokens'],
    healthCheck: async () => true
  },
  {
    id: 'conn-aws-kms',
    name: 'AWS KMS & IAM Policy Engine',
    category: 'cloud_kms',
    status: 'simulated',
    supportedActions: ['reassign_key_custodian', 'rotate_role_policy', 'check_active_grants'],
    healthCheck: async () => true
  },
  {
    id: 'conn-gcp-kms',
    name: 'Google Cloud Key Management (KMS)',
    category: 'cloud_kms',
    status: 'simulated',
    supportedActions: ['transfer_kms_ownership', 'rotate_service_account_keys'],
    healthCheck: async () => true
  },
  {
    id: 'conn-datadog',
    name: 'Datadog Observability & Metric Connector',
    category: 'observability',
    status: 'simulated',
    supportedActions: ['fetch_active_connection_rates', 'query_endpoint_sla', 'trigger_maintenance_window'],
    healthCheck: async () => true
  },
  {
    id: 'conn-pagerduty',
    name: 'PagerDuty Incident & Escalation Connector',
    category: 'workflow',
    status: 'simulated',
    supportedActions: ['suppress_expected_alerts', 'notify_domain_lead', 'reassign_oncall_schedule'],
    healthCheck: async () => true
  }
];
