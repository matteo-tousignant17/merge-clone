export type IntegrationCategory = "hris" | "ats" | "crm" | "ticketing" | "accounting" | "file-storage";
export type LinkedAccountStatus = "LINKED" | "IDLE" | "INCOMPLETE" | "RELINK";
export type IssueStatus = "ONGOING" | "RESOLVED";
export type ScopeStatus = "ENABLED" | "DISABLED" | "OPTIONAL";
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
export type SyncStatus = "DONE" | "SYNCING" | "FAILED" | "PENDING";

export interface Integration {
  id: string;
  name: string;
  slug: string;
  category: IntegrationCategory;
  color: string;
  initials: string;
}

export interface LinkedAccount {
  id: string;
  orgName: string;
  integrationId: string;
  endUserOriginId: string;
  accountToken: string;
  isTest: boolean;
  status: LinkedAccountStatus;
  category: IntegrationCategory;
  linkedAt: string;
  lastSyncAt: string | null;
  issueCount: number;
}

export interface Issue {
  id: string;
  linkedAccountId: string;
  type: string;
  status: IssueStatus;
  remediationText: string;
  createdAt: string;
  resolvedAt: string | null;
  errorCode?: number;
}

export interface LogEntry {
  id: string;
  linkedAccountId: string;
  issueId: string | null;
  method: HttpMethod;
  url: string;
  statusCode: number;
  responseTime: number;
  createdAt: string;
}

export interface SyncModel {
  id: string;
  modelName: string;
  scope: "READ" | "WRITE" | "NONE";
  status: SyncStatus;
  lastSyncStart: string | null;
  nextSync: string | null;
}

export interface CommonModelField {
  name: string;
  type: string;
  scope: ScopeStatus;
}

export interface CommonModel {
  id: string;
  category: IntegrationCategory;
  modelName: string;
  fields: CommonModelField[];
}

// ─── Integrations ───────────────────────────────────────────────
export const integrations: Integration[] = [
  // HRIS
  { id: "int_bamboohr", name: "BambooHR", slug: "bamboohr", category: "hris", color: "#73B02A", initials: "BB" },
  { id: "int_workday", name: "Workday", slug: "workday", category: "hris", color: "#F5821F", initials: "WD" },
  { id: "int_adp", name: "ADP Workforce Now", slug: "adp", category: "hris", color: "#D31145", initials: "ADP" },
  { id: "int_gusto", name: "Gusto", slug: "gusto", category: "hris", color: "#F45D48", initials: "GU" },
  { id: "int_rippling", name: "Rippling", slug: "rippling", category: "hris", color: "#FF4F00", initials: "RP" },
  { id: "int_sagehr", name: "Sage HR", slug: "sage-hr", category: "hris", color: "#00DC82", initials: "SG" },
  { id: "int_ukgpro", name: "UKG Pro", slug: "ukg-pro", category: "hris", color: "#005BBB", initials: "UKG" },
  { id: "int_hibob", name: "HiBob", slug: "hibob", category: "hris", color: "#7B61FF", initials: "HB" },
  // ATS
  { id: "int_greenhouse", name: "Greenhouse", slug: "greenhouse", category: "ats", color: "#24A36E", initials: "GH" },
  { id: "int_lever", name: "Lever", slug: "lever", category: "ats", color: "#3B1FA3", initials: "LV" },
  { id: "int_icims", name: "iCIMS", slug: "icims", category: "ats", color: "#0076CE", initials: "iC" },
  { id: "int_ashby", name: "Ashby", slug: "ashby", category: "ats", color: "#1A1A1A", initials: "AS" },
  { id: "int_workable", name: "Workable", slug: "workable", category: "ats", color: "#3AB549", initials: "WK" },
  // CRM
  { id: "int_salesforce", name: "Salesforce", slug: "salesforce", category: "crm", color: "#00A1E0", initials: "SF" },
  { id: "int_hubspot", name: "HubSpot", slug: "hubspot", category: "crm", color: "#FF7A59", initials: "HS" },
  { id: "int_pipedrive", name: "Pipedrive", slug: "pipedrive", category: "crm", color: "#28A745", initials: "PD" },
  { id: "int_zoho", name: "Zoho CRM", slug: "zoho-crm", category: "crm", color: "#E42527", initials: "ZO" },
  // Ticketing
  { id: "int_jira", name: "Jira", slug: "jira", category: "ticketing", color: "#0052CC", initials: "JR" },
  { id: "int_zendesk", name: "Zendesk", slug: "zendesk", category: "ticketing", color: "#03363D", initials: "ZD" },
  { id: "int_servicenow", name: "ServiceNow", slug: "servicenow", category: "ticketing", color: "#62D84E", initials: "SN" },
  { id: "int_linear", name: "Linear", slug: "linear", category: "ticketing", color: "#5E6AD2", initials: "LN" },
  // Accounting
  { id: "int_quickbooks", name: "QuickBooks", slug: "quickbooks", category: "accounting", color: "#2CA01C", initials: "QB" },
  { id: "int_netsuite", name: "NetSuite", slug: "netsuite", category: "accounting", color: "#009CDE", initials: "NS" },
  { id: "int_xero", name: "Xero", slug: "xero", category: "accounting", color: "#13B5EA", initials: "XR" },
  { id: "int_sage", name: "Sage Intacct", slug: "sage-intacct", category: "accounting", color: "#00DC82", initials: "SI" },
];

export const getIntegration = (id: string) => integrations.find(i => i.id === id);
export const getIntegrationsByCategory = (cat: IntegrationCategory) => integrations.filter(i => i.category === cat);

// ─── Linked Accounts ────────────────────────────────────────────
export const linkedAccounts: LinkedAccount[] = [
  {
    id: "la_001", orgName: "Wonka Candy Company", integrationId: "int_netsuite",
    endUserOriginId: "org_wonka", accountToken: "at_wonka_netsuite_xK92mP3qR7",
    isTest: false, status: "INCOMPLETE", category: "accounting",
    linkedAt: "2024-11-15T10:23:00Z", lastSyncAt: "2024-11-20T08:00:00Z", issueCount: 1,
  },
  {
    id: "la_002", orgName: "Acme Corporation", integrationId: "int_bamboohr",
    endUserOriginId: "org_acme", accountToken: "at_acme_bamboo_aB34cD56eF",
    isTest: false, status: "LINKED", category: "hris",
    linkedAt: "2024-10-03T14:00:00Z", lastSyncAt: "2024-11-21T12:00:00Z", issueCount: 0,
  },
  {
    id: "la_003", orgName: "Globex Corp", integrationId: "int_greenhouse",
    endUserOriginId: "org_globex", accountToken: "at_globex_gh_gH78iJ90kL",
    isTest: false, status: "LINKED", category: "ats",
    linkedAt: "2024-09-17T09:00:00Z", lastSyncAt: "2024-11-21T11:30:00Z", issueCount: 0,
  },
  {
    id: "la_004", orgName: "Initech LLC", integrationId: "int_salesforce",
    endUserOriginId: "org_initech", accountToken: "at_initech_sf_mN12oP34qR",
    isTest: false, status: "RELINK", category: "crm",
    linkedAt: "2024-08-22T16:00:00Z", lastSyncAt: "2024-11-10T10:00:00Z", issueCount: 2,
  },
  {
    id: "la_005", orgName: "Umbrella Corp", integrationId: "int_jira",
    endUserOriginId: "org_umbrella", accountToken: "at_umbrella_jira_sT56uV78wX",
    isTest: false, status: "LINKED", category: "ticketing",
    linkedAt: "2024-07-11T11:00:00Z", lastSyncAt: "2024-11-21T10:00:00Z", issueCount: 0,
  },
  {
    id: "la_006", orgName: "Dunder Mifflin", integrationId: "int_workday",
    endUserOriginId: "org_dunder", accountToken: "at_dunder_wd_yZ01aB23cD",
    isTest: false, status: "LINKED", category: "hris",
    linkedAt: "2024-06-05T08:00:00Z", lastSyncAt: "2024-11-21T09:00:00Z", issueCount: 0,
  },
  {
    id: "la_007", orgName: "Pied Piper", integrationId: "int_lever",
    endUserOriginId: "org_piedpiper", accountToken: "at_pp_lever_eF45gH67iJ",
    isTest: false, status: "INCOMPLETE", category: "ats",
    linkedAt: "2024-11-01T13:00:00Z", lastSyncAt: null, issueCount: 1,
  },
  {
    id: "la_008", orgName: "Hooli Inc", integrationId: "int_hubspot",
    endUserOriginId: "org_hooli", accountToken: "at_hooli_hs_kL89mN01oP",
    isTest: false, status: "LINKED", category: "crm",
    linkedAt: "2024-05-19T15:00:00Z", lastSyncAt: "2024-11-21T08:30:00Z", issueCount: 0,
  },
  // Test accounts
  {
    id: "la_t01", orgName: "Test Company Alpha", integrationId: "int_bamboohr",
    endUserOriginId: "test_alpha", accountToken: "at_test_alpha_bamboo",
    isTest: true, status: "LINKED", category: "hris",
    linkedAt: "2024-11-10T10:00:00Z", lastSyncAt: "2024-11-21T12:00:00Z", issueCount: 0,
  },
  {
    id: "la_t02", orgName: "Test Company Beta", integrationId: "int_greenhouse",
    endUserOriginId: "test_beta", accountToken: "at_test_beta_gh",
    isTest: true, status: "INCOMPLETE", category: "ats",
    linkedAt: "2024-11-12T09:00:00Z", lastSyncAt: null, issueCount: 1,
  },
  {
    id: "la_t03", orgName: "Test Company Gamma", integrationId: "int_salesforce",
    endUserOriginId: "test_gamma", accountToken: "at_test_gamma_sf",
    isTest: true, status: "LINKED", category: "crm",
    linkedAt: "2024-11-14T11:00:00Z", lastSyncAt: "2024-11-21T10:00:00Z", issueCount: 0,
  },
];

export const getLinkedAccount = (id: string) => linkedAccounts.find(a => a.id === id);

// ─── Issues ─────────────────────────────────────────────────────
export const issues: Issue[] = [
  {
    id: "iss_001", linkedAccountId: "la_001", type: "Missing permission",
    status: "ONGOING",
    remediationText: "The NetSuite integration is missing required permissions. Please ask your customer to log into NetSuite and grant the following role permissions: Transactions > Invoices, Reports > Financial Statements. Once granted, click 'Relink with Magic Link' to re-authenticate.",
    createdAt: "2024-11-20T08:15:00Z", resolvedAt: null, errorCode: 403,
  },
  {
    id: "iss_002", linkedAccountId: "la_004", type: "Invalid credentials",
    status: "ONGOING",
    remediationText: "The Salesforce credentials for this linked account have expired or been revoked. Please ask your customer to re-authenticate by clicking 'Relink with Magic Link' below.",
    createdAt: "2024-11-10T10:30:00Z", resolvedAt: null, errorCode: 401,
  },
  {
    id: "iss_003", linkedAccountId: "la_004", type: "Rate limit exceeded",
    status: "RESOLVED",
    remediationText: "Salesforce API rate limit was exceeded. Data sync has been paused and will automatically resume when the rate limit resets.",
    createdAt: "2024-11-08T14:00:00Z", resolvedAt: "2024-11-09T02:00:00Z", errorCode: 429,
  },
  {
    id: "iss_004", linkedAccountId: "la_007", type: "Missing permission",
    status: "ONGOING",
    remediationText: "Lever integration requires access to the Candidate data scope. Please ask your customer to update the API token permissions in Lever's developer settings.",
    createdAt: "2024-11-01T13:15:00Z", resolvedAt: null, errorCode: 403,
  },
  {
    id: "iss_005", linkedAccountId: "la_t02", type: "Missing permission",
    status: "ONGOING",
    remediationText: "Greenhouse integration is missing interview kit read permissions.",
    createdAt: "2024-11-12T09:30:00Z", resolvedAt: null, errorCode: 403,
  },
];

export const getIssue = (id: string) => issues.find(i => i.id === id);
export const getIssuesByLinkedAccount = (laId: string) => issues.filter(i => i.linkedAccountId === laId);

// ─── Logs ────────────────────────────────────────────────────────
const baseUrls = {
  hris: "https://api.merge.dev/api/hris/v1",
  ats: "https://api.merge.dev/api/ats/v1",
  crm: "https://api.merge.dev/api/crm/v1",
  ticketing: "https://api.merge.dev/api/ticketing/v1",
  accounting: "https://api.merge.dev/api/accounting/v1",
  "file-storage": "https://api.merge.dev/api/filestorage/v1",
};

export const logs: LogEntry[] = [
  { id: "log_001", linkedAccountId: "la_001", issueId: "iss_001", method: "GET", url: `${baseUrls.accounting}/invoices`, statusCode: 403, responseTime: 212, createdAt: "2024-11-20T08:14:52Z" },
  { id: "log_002", linkedAccountId: "la_001", issueId: "iss_001", method: "GET", url: `${baseUrls.accounting}/accounts`, statusCode: 403, responseTime: 198, createdAt: "2024-11-20T08:14:50Z" },
  { id: "log_003", linkedAccountId: "la_001", issueId: null, method: "GET", url: `${baseUrls.accounting}/company-info`, statusCode: 200, responseTime: 345, createdAt: "2024-11-19T16:00:00Z" },
  { id: "log_004", linkedAccountId: "la_002", issueId: null, method: "GET", url: `${baseUrls.hris}/employees`, statusCode: 200, responseTime: 289, createdAt: "2024-11-21T12:00:00Z" },
  { id: "log_005", linkedAccountId: "la_002", issueId: null, method: "GET", url: `${baseUrls.hris}/time-off`, statusCode: 200, responseTime: 156, createdAt: "2024-11-21T12:00:10Z" },
  { id: "log_006", linkedAccountId: "la_003", issueId: null, method: "GET", url: `${baseUrls.ats}/candidates`, statusCode: 200, responseTime: 421, createdAt: "2024-11-21T11:30:00Z" },
  { id: "log_007", linkedAccountId: "la_003", issueId: null, method: "POST", url: `${baseUrls.ats}/candidates`, statusCode: 201, responseTime: 512, createdAt: "2024-11-21T11:25:00Z" },
  { id: "log_008", linkedAccountId: "la_004", issueId: "iss_002", method: "GET", url: `${baseUrls.crm}/contacts`, statusCode: 401, responseTime: 145, createdAt: "2024-11-10T10:30:00Z" },
  { id: "log_009", linkedAccountId: "la_004", issueId: "iss_002", method: "GET", url: `${baseUrls.crm}/accounts`, statusCode: 401, responseTime: 132, createdAt: "2024-11-10T10:30:05Z" },
  { id: "log_010", linkedAccountId: "la_005", issueId: null, method: "GET", url: `${baseUrls.ticketing}/tickets`, statusCode: 200, responseTime: 378, createdAt: "2024-11-21T10:00:00Z" },
  { id: "log_011", linkedAccountId: "la_005", issueId: null, method: "GET", url: `${baseUrls.ticketing}/users`, statusCode: 200, responseTime: 201, createdAt: "2024-11-21T10:00:05Z" },
  { id: "log_012", linkedAccountId: "la_006", issueId: null, method: "GET", url: `${baseUrls.hris}/employees`, statusCode: 200, responseTime: 445, createdAt: "2024-11-21T09:00:00Z" },
];

export const getLogsByLinkedAccount = (laId: string) => logs.filter(l => l.linkedAccountId === laId);
export const getLogsByIssue = (issueId: string) => logs.filter(l => l.issueId === issueId);

// ─── Sync Models ─────────────────────────────────────────────────
const hrisSyncModels: SyncModel[] = [
  { id: "sm_emp", modelName: "Employee", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T12:00:00Z", nextSync: "2024-11-22T12:00:00Z" },
  { id: "sm_dep", modelName: "Department", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T12:00:00Z", nextSync: "2024-11-22T12:00:00Z" },
  { id: "sm_loc", modelName: "Location", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T12:01:00Z", nextSync: "2024-11-22T12:01:00Z" },
  { id: "sm_toff", modelName: "TimeOff", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T12:01:00Z", nextSync: "2024-11-22T12:01:00Z" },
  { id: "sm_empl", modelName: "Employment", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T12:02:00Z", nextSync: "2024-11-22T12:02:00Z" },
  { id: "sm_ben", modelName: "Benefit", scope: "NONE", status: "PENDING", lastSyncStart: null, nextSync: null },
];

const atsSyncModels: SyncModel[] = [
  { id: "sm_cand", modelName: "Candidate", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T11:30:00Z", nextSync: "2024-11-22T11:30:00Z" },
  { id: "sm_app", modelName: "Application", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T11:30:00Z", nextSync: "2024-11-22T11:30:00Z" },
  { id: "sm_job", modelName: "Job", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T11:31:00Z", nextSync: "2024-11-22T11:31:00Z" },
  { id: "sm_off", modelName: "Offer", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T11:32:00Z", nextSync: "2024-11-22T11:32:00Z" },
  { id: "sm_int", modelName: "Interview", scope: "WRITE", status: "DONE", lastSyncStart: "2024-11-21T11:33:00Z", nextSync: "2024-11-22T11:33:00Z" },
];

const accountingSyncModels: SyncModel[] = [
  { id: "sm_inv", modelName: "Invoice", scope: "READ", status: "FAILED", lastSyncStart: "2024-11-20T08:14:00Z", nextSync: null },
  { id: "sm_acc", modelName: "Account", scope: "READ", status: "FAILED", lastSyncStart: "2024-11-20T08:14:00Z", nextSync: null },
  { id: "sm_pay", modelName: "Payment", scope: "NONE", status: "PENDING", lastSyncStart: null, nextSync: null },
  { id: "sm_ci", modelName: "CompanyInfo", scope: "READ", status: "DONE", lastSyncStart: "2024-11-19T16:00:00Z", nextSync: "2024-11-20T16:00:00Z" },
];

const crmSyncModels: SyncModel[] = [
  { id: "sm_con", modelName: "Contact", scope: "READ", status: "FAILED", lastSyncStart: "2024-11-10T10:30:00Z", nextSync: null },
  { id: "sm_accts", modelName: "Account", scope: "READ", status: "FAILED", lastSyncStart: "2024-11-10T10:30:00Z", nextSync: null },
  { id: "sm_opp", modelName: "Opportunity", scope: "NONE", status: "PENDING", lastSyncStart: null, nextSync: null },
  { id: "sm_lead", modelName: "Lead", scope: "NONE", status: "PENDING", lastSyncStart: null, nextSync: null },
];

const ticketingSyncModels: SyncModel[] = [
  { id: "sm_tkt", modelName: "Ticket", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T10:00:00Z", nextSync: "2024-11-22T10:00:00Z" },
  { id: "sm_usr", modelName: "User", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T10:00:00Z", nextSync: "2024-11-22T10:00:00Z" },
  { id: "sm_prj", modelName: "Project", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T10:01:00Z", nextSync: "2024-11-22T10:01:00Z" },
  { id: "sm_team", modelName: "Team", scope: "READ", status: "DONE", lastSyncStart: "2024-11-21T10:01:00Z", nextSync: "2024-11-22T10:01:00Z" },
];

export const getSyncModels = (category: IntegrationCategory): SyncModel[] => {
  const map: Record<IntegrationCategory, SyncModel[]> = {
    hris: hrisSyncModels,
    ats: atsSyncModels,
    accounting: accountingSyncModels,
    crm: crmSyncModels,
    ticketing: ticketingSyncModels,
    "file-storage": [],
  };
  return map[category] ?? [];
};

// ─── Common Models / Scopes ──────────────────────────────────────
export const commonModels: CommonModel[] = [
  // HRIS
  {
    id: "cm_employee", category: "hris", modelName: "Employee",
    fields: [
      { name: "employee_number", type: "String", scope: "ENABLED" },
      { name: "company", type: "String", scope: "ENABLED" },
      { name: "first_name", type: "String", scope: "ENABLED" },
      { name: "last_name", type: "String", scope: "ENABLED" },
      { name: "preferred_first_name", type: "String", scope: "OPTIONAL" },
      { name: "display_full_name", type: "String", scope: "ENABLED" },
      { name: "username", type: "String", scope: "OPTIONAL" },
      { name: "work_email", type: "String", scope: "ENABLED" },
      { name: "personal_email", type: "String", scope: "OPTIONAL" },
      { name: "mobile_phone_number", type: "String", scope: "OPTIONAL" },
      { name: "employment_status", type: "String", scope: "ENABLED" },
      { name: "employment_type", type: "String", scope: "OPTIONAL" },
      { name: "start_date", type: "Date", scope: "ENABLED" },
      { name: "termination_date", type: "Date", scope: "OPTIONAL" },
      { name: "manager", type: "String", scope: "OPTIONAL" },
      { name: "team", type: "String", scope: "OPTIONAL" },
      { name: "pay_rate", type: "Decimal", scope: "DISABLED" },
      { name: "pay_currency", type: "String", scope: "DISABLED" },
      { name: "date_of_birth", type: "Date", scope: "DISABLED" },
      { name: "gender", type: "String", scope: "DISABLED" },
    ],
  },
  {
    id: "cm_department", category: "hris", modelName: "Department",
    fields: [
      { name: "name", type: "String", scope: "ENABLED" },
      { name: "parent_department", type: "String", scope: "OPTIONAL" },
    ],
  },
  {
    id: "cm_employment", category: "hris", modelName: "Employment",
    fields: [
      { name: "job_title", type: "String", scope: "ENABLED" },
      { name: "pay_rate", type: "Decimal", scope: "DISABLED" },
      { name: "pay_period", type: "String", scope: "DISABLED" },
      { name: "pay_frequency", type: "String", scope: "DISABLED" },
      { name: "pay_currency", type: "String", scope: "DISABLED" },
      { name: "effective_date", type: "Date", scope: "ENABLED" },
      { name: "employment_type", type: "String", scope: "OPTIONAL" },
      { name: "flsa_status", type: "String", scope: "OPTIONAL" },
    ],
  },
  // ATS
  {
    id: "cm_candidate", category: "ats", modelName: "Candidate",
    fields: [
      { name: "first_name", type: "String", scope: "ENABLED" },
      { name: "last_name", type: "String", scope: "ENABLED" },
      { name: "company", type: "String", scope: "OPTIONAL" },
      { name: "title", type: "String", scope: "OPTIONAL" },
      { name: "last_interaction_at", type: "DateTime", scope: "ENABLED" },
      { name: "is_private", type: "Boolean", scope: "OPTIONAL" },
      { name: "can_email", type: "Boolean", scope: "OPTIONAL" },
      { name: "locations", type: "String[]", scope: "OPTIONAL" },
      { name: "phone_numbers", type: "PhoneNumber[]", scope: "ENABLED" },
      { name: "email_addresses", type: "EmailAddress[]", scope: "ENABLED" },
      { name: "urls", type: "Url[]", scope: "OPTIONAL" },
    ],
  },
  {
    id: "cm_application", category: "ats", modelName: "Application",
    fields: [
      { name: "candidate", type: "String", scope: "ENABLED" },
      { name: "job", type: "String", scope: "ENABLED" },
      { name: "applied_at", type: "DateTime", scope: "ENABLED" },
      { name: "rejected_at", type: "DateTime", scope: "OPTIONAL" },
      { name: "source", type: "String", scope: "OPTIONAL" },
      { name: "current_stage", type: "String", scope: "ENABLED" },
      { name: "reject_reason", type: "String", scope: "OPTIONAL" },
    ],
  },
  // Accounting
  {
    id: "cm_invoice", category: "accounting", modelName: "Invoice",
    fields: [
      { name: "type", type: "String", scope: "ENABLED" },
      { name: "contact", type: "String", scope: "ENABLED" },
      { name: "number", type: "String", scope: "ENABLED" },
      { name: "issue_date", type: "Date", scope: "ENABLED" },
      { name: "due_date", type: "Date", scope: "ENABLED" },
      { name: "paid_on_date", type: "Date", scope: "OPTIONAL" },
      { name: "memo", type: "String", scope: "OPTIONAL" },
      { name: "status", type: "String", scope: "ENABLED" },
      { name: "currency", type: "String", scope: "ENABLED" },
      { name: "total_amount", type: "Decimal", scope: "ENABLED" },
      { name: "amount_due", type: "Decimal", scope: "ENABLED" },
      { name: "accounting_period", type: "String", scope: "OPTIONAL" },
      { name: "applied_credit_notes", type: "String", scope: "OPTIONAL" },
      { name: "applied_payments", type: "String", scope: "OPTIONAL" },
      { name: "applied_vendor_credits", type: "String", scope: "OPTIONAL" },
    ],
  },
  {
    id: "cm_income_stmt", category: "accounting", modelName: "IncomeStatement",
    fields: [
      { name: "name", type: "String", scope: "ENABLED" },
      { name: "currency", type: "String", scope: "ENABLED" },
      { name: "start_period", type: "Date", scope: "ENABLED" },
      { name: "end_period", type: "Date", scope: "ENABLED" },
      { name: "income", type: "ReportItem[]", scope: "ENABLED" },
      { name: "cost_of_sales", type: "ReportItem[]", scope: "OPTIONAL" },
      { name: "gross_profit", type: "Decimal", scope: "ENABLED" },
      { name: "operating_expenses", type: "ReportItem[]", scope: "OPTIONAL" },
      { name: "net_income", type: "Decimal", scope: "ENABLED" },
    ],
  },
  // CRM
  {
    id: "cm_contact", category: "crm", modelName: "Contact",
    fields: [
      { name: "first_name", type: "String", scope: "ENABLED" },
      { name: "last_name", type: "String", scope: "ENABLED" },
      { name: "account", type: "String", scope: "OPTIONAL" },
      { name: "email_addresses", type: "EmailAddress[]", scope: "ENABLED" },
      { name: "phone_numbers", type: "PhoneNumber[]", scope: "ENABLED" },
      { name: "last_activity_at", type: "DateTime", scope: "OPTIONAL" },
    ],
  },
  {
    id: "cm_opportunity", category: "crm", modelName: "Opportunity",
    fields: [
      { name: "name", type: "String", scope: "ENABLED" },
      { name: "description", type: "String", scope: "OPTIONAL" },
      { name: "amount", type: "Decimal", scope: "OPTIONAL" },
      { name: "owner", type: "String", scope: "OPTIONAL" },
      { name: "account", type: "String", scope: "OPTIONAL" },
      { name: "stage", type: "String", scope: "ENABLED" },
      { name: "status", type: "String", scope: "ENABLED" },
      { name: "close_date", type: "Date", scope: "OPTIONAL" },
    ],
  },
  // Ticketing
  {
    id: "cm_ticket", category: "ticketing", modelName: "Ticket",
    fields: [
      { name: "name", type: "String", scope: "ENABLED" },
      { name: "description", type: "String", scope: "OPTIONAL" },
      { name: "status", type: "String", scope: "ENABLED" },
      { name: "priority", type: "String", scope: "OPTIONAL" },
      { name: "ticket_type", type: "String", scope: "OPTIONAL" },
      { name: "assignees", type: "String[]", scope: "OPTIONAL" },
      { name: "creator", type: "String", scope: "OPTIONAL" },
      { name: "project", type: "String", scope: "OPTIONAL" },
      { name: "due_date", type: "DateTime", scope: "OPTIONAL" },
      { name: "completed_at", type: "DateTime", scope: "OPTIONAL" },
    ],
  },
];

export const getCommonModelsByCategory = (category: IntegrationCategory) =>
  commonModels.filter(m => m.category === category);

// ─── Dashboard Stats ──────────────────────────────────────────────
export const apiRequestData = [
  { date: "Jan", requests: 4200000 },
  { date: "Feb", requests: 5100000 },
  { date: "Mar", requests: 4800000 },
  { date: "Apr", requests: 6200000 },
  { date: "May", requests: 5900000 },
  { date: "Jun", requests: 7100000 },
  { date: "Jul", requests: 6800000 },
  { date: "Aug", requests: 7500000 },
  { date: "Sep", requests: 8100000 },
  { date: "Oct", requests: 7900000 },
  { date: "Nov", requests: 8684787 },
];

export const categoryLabels: Record<IntegrationCategory, string> = {
  hris: "HR and Payroll",
  ats: "Applicant Tracking",
  crm: "CRM",
  ticketing: "Ticketing",
  accounting: "Accounting",
  "file-storage": "File Storage",
};
