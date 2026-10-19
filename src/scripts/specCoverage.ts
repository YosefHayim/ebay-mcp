const KNOWN_OPERATION_MAPPINGS: Readonly<Record<string, readonly string[]>> = {
  // Feedback API
  getitemsawaitingfeedback: ['ebay_get_awaiting_feedback'],
  leavefeedback: ['ebay_leave_feedback_for_buyer'],

  // Notification API — tools use the ebay_*_notification_* naming convention
  getconfig: ['ebay_get_notification_config'],
  updateconfig: ['ebay_update_notification_config'],
  getdestinations: ['ebay_get_notification_destinations'],
  createdestination: ['ebay_create_notification_destination'],
  getdestination: ['ebay_get_notification_destination'],
  updatedestination: ['ebay_update_notification_destination'],
  deletedestination: ['ebay_delete_notification_destination'],
  getsubscriptions: ['ebay_get_notification_subscriptions'],
  createsubscription: ['ebay_create_notification_subscription'],
  getsubscription: ['ebay_get_notification_subscription'],
  updatesubscription: ['ebay_update_notification_subscription'],
  deletesubscription: ['ebay_delete_notification_subscription'],
  disablesubscription: ['ebay_disable_notification_subscription'],
  enablesubscription: ['ebay_enable_notification_subscription'],
  testsubscription: ['ebay_test_notification_subscription'],
  createsubscriptionfilter: ['ebay_create_notification_subscription_filter'],
  getsubscriptionfilter: ['ebay_get_notification_subscription_filter'],
  deletesubscriptionfilter: ['ebay_delete_notification_subscription_filter'],
  gettopic: ['ebay_get_notification_topic'],
  gettopics: ['ebay_get_notification_topics'],
  getpublickey: ['ebay_get_notification_public_key'],

  // Negotiation API
  findeligibleitems: ['ebay_find_eligible_items'],

  // Marketing API
  createadbylistingid: ['ebay_create_ad_by_listing_id'],
  updatebid: ['ebay_update_bid'],
  bulkcreatekeyword: ['ebay_bulk_create_keyword'],
  bulkupdatekeyword: ['ebay_bulk_update_keyword'],
  bulkcreatenegativekeyword: ['ebay_bulk_create_negative_keyword'],
  bulkupdatenegativekeyword: ['ebay_bulk_update_negative_keyword'],
  getnegativekeywords: ['ebay_get_negative_keywords'],
  createnegativekeyword: ['ebay_create_negative_keyword'],
  getnegativekeyword: ['ebay_get_negative_keyword'],
  updatenegativekeyword: ['ebay_update_negative_keyword'],
  getreportmetadata: ['ebay_get_report_metadata'],
  getreportmetadataforreporttype: ['ebay_get_report_metadata_for_report_type'],
  getpromotionreports: ['ebay_get_promotion_reports'],
  getaudiences: ['ebay_get_audiences'],

  // Dispute/Fulfillment API
  fetchevidencecontent: ['ebay_fetch_evidence_content'],
  getactivities: ['ebay_get_payment_dispute_activities', 'ebay_get_activities'],
  uploadevidencefile: ['ebay_upload_evidence_file'],
  addevidence: ['ebay_add_evidence'],
  updateevidence: ['ebay_update_evidence'],
};

const ITEMS_SUFFIX = /items?$/;
const BY_SUFFIX = /by\w+$/;
const FOR_SUFFIX = /for\w+$/;

const singularOrPlural = (name: string): string =>
  name.endsWith('s') && !name.endsWith('ss') ? name.slice(0, -1) : `${name}s`;

const fuzzyNameVariations = (operationId: string): ReadonlySet<string> => {
  const normalized = normalizeForMatching(operationId);
  const stems = [
    normalized,
    normalized.replace(ITEMS_SUFFIX, ''),
    normalized.replace(BY_SUFFIX, ''),
    normalized.replace(FOR_SUFFIX, ''),
    singularOrPlural(normalized),
  ];
  const prefixedStems = stems.map((stem) => `ebay${stem}`);
  const mappedTools = KNOWN_OPERATION_MAPPINGS[normalized] || [];
  const mappedNames = mappedTools.map(normalizeForMatching);
  return new Set([...stems, ...prefixedStems, ...mappedNames]);
};

export const normalizeForMatching = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '');

export interface ImplementedNames {
  readonly apiMethods: ReadonlySet<string>;
  readonly normalizedNames: ReadonlySet<string>;
}

export const collectImplementedNames = (
  apiMethods: readonly string[],
  toolNames: readonly string[],
): ImplementedNames => {
  const normalizedNames = [...apiMethods, ...toolNames].map(normalizeForMatching);
  return { apiMethods: new Set(apiMethods), normalizedNames: new Set(normalizedNames) };
};

export type OperationCoverage = 'exact' | 'fuzzy' | 'missing';

export const classifyOperation = (
  operationId: string,
  implemented: ImplementedNames,
): OperationCoverage => {
  if (implemented.apiMethods.has(operationId)) {
    return 'exact';
  }
  const variations = fuzzyNameVariations(operationId);
  const hasFuzzyMatch = [...variations].some((name) => implemented.normalizedNames.has(name));
  return hasFuzzyMatch ? 'fuzzy' : 'missing';
};
