import companyData from "../data/company-data.json";

export interface CompanyDataTranslations {
  company_type?: Record<string, string>;
  company_status?: Record<string, string>;
  officer_role?: Record<string, string>;
  sic_descriptions?: Record<string, string>;
}

/**
 * Get company data translations (works on both server and client)
 */
export function loadCompanyData(): CompanyDataTranslations {
  return companyData as CompanyDataTranslations;
}

/**
 * Translate a company type value
 */
export function translateCompanyType(value: string | undefined, translations?: CompanyDataTranslations): string {
  if (!value) return 'Not available';
  if (!translations) return value;
  return translations.company_type?.[value] || value;
}

/**
 * Translate a company status value
 */
export function translateCompanyStatus(value: string | undefined, translations?: CompanyDataTranslations): string {
  if (!value) return 'Not available';
  if (!translations) return value;
  return translations.company_status?.[value] || value;
}

/**
 * Translate an officer role value
 */
export function translateOfficerRole(value: string | undefined, translations?: CompanyDataTranslations): string {
  if (!value) return 'Unknown';
  if (!translations) return value;
  return translations.officer_role?.[value] || value;
}

/**
 * Translate SIC codes to descriptions
 */
export function translateSicCode(sicCode: string, translations?: CompanyDataTranslations): string {
  if (!sicCode) return sicCode;
  if (!translations) return sicCode;
  return translations.sic_descriptions?.[sicCode] || sicCode;
}

/**
 * Translate multiple SIC codes
 */
export function translateSicCodes(sicCodes: string[] | undefined, translations?: CompanyDataTranslations): string[] {
  if (!sicCodes || sicCodes.length === 0) return [];
  return sicCodes.map(code => translateSicCode(code, translations));
}
