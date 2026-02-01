import type { Route } from "./+types/company.$id._index";
import { Link, useParams, useLocation } from "react-router";
import { getApiConfig, createApiUrl } from "../lib/api-client";
import { ErrorBoundary as ErrorBoundaryComponent } from "../components/ErrorBoundary";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { BackButton } from "../components/BackButton";
import {
  loadCompanyData,
  translateCompanyType,
  translateCompanyStatus,
  translateOfficerRole,
  translateSicCodes,
  type CompanyDataTranslations,
} from "../lib/company-data";
import filingHistoryEnumData from "../data/filing-history-enum.json";

function loadFilingHistoryEnum() {
  return filingHistoryEnumData.description || {};
}

function translateFilingDescription(
  descriptionEnum: string | undefined,
  descriptionValues: Record<string, any> | undefined,
  enumMap: Record<string, string>
): string {
  if (!descriptionEnum) {
    return 'No description available';
  }

  let translated = enumMap[descriptionEnum] || descriptionEnum;

  if (descriptionValues) {
    Object.entries(descriptionValues).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        const date = new Date(value);
        const formattedDate = date.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        translated = translated.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), formattedDate);
      } else {
        translated = translated.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(value));
      }
    });
  }

  translated = translated.replace(/\*\*/g, '');

  return translated;
}

export async function loader({ params }: Route.LoaderArgs) {
  const companyNumber = params.id;
  
  if (!companyNumber) {
    throw new Response("Company number is required", { status: 400 });
  }

  const filingHistoryEnum = loadFilingHistoryEnum();
  const companyDataTranslations = loadCompanyData();

  const config = getApiConfig();
  
  const companyUrl = createApiUrl(`company/${companyNumber}`, config.apiUrl);
  const officersUrl = createApiUrl(`company/${companyNumber}/officers`, config.apiUrl);
  const filingHistoryUrl = createApiUrl(`company/${companyNumber}/filing-history`, config.apiUrl);
  filingHistoryUrl.searchParams.set('items_per_page', '10');
  
  const [companyResponse, officersResponse, filingHistoryResponse] = await Promise.all([
    fetch(companyUrl.toString(), {
      method: 'GET',
      headers: config.headers,
    }),
    fetch(officersUrl.toString(), {
      method: 'GET',
      headers: config.headers,
    }),
    fetch(filingHistoryUrl.toString(), {
      method: 'GET',
      headers: config.headers,
    }),
  ]);
  
  if (!companyResponse.ok) {
    if (companyResponse.status === 404) {
      throw new Response("Company not found", { status: 404 });
    }
    const errorText = await companyResponse.text().catch(() => 'Unknown error');
    throw new Error(`API request failed with status: ${companyResponse.status}. ${errorText}`);
  }
  
  const companyData = await companyResponse.json();
  
  let officersData = null;
  if (officersResponse.ok) {
    officersData = await officersResponse.json();
  } else {
    console.warn(`Failed to fetch officers: ${officersResponse.status}`);
  }
  
  let filingHistoryData = null;
  if (filingHistoryResponse.ok) {
    filingHistoryData = await filingHistoryResponse.json();
    
    if (filingHistoryData.items && Array.isArray(filingHistoryData.items)) {
      filingHistoryData.items = filingHistoryData.items.map((filing: any) => ({
        ...filing,
        translatedDescription: translateFilingDescription(
          filing.description,
          filing.description_values,
          filingHistoryEnum
        )
      }));
    }
  } else {
    console.warn(`Failed to fetch filing history: ${filingHistoryResponse.status}`);
  }
  
  return {
    companyData,
    officersData,
    filingHistoryData,
    companyDataTranslations,
  };
}

export function HydrateFallback() {
  return <LoadingSkeleton variant="company-details" />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <ErrorBoundaryComponent
      error={error}
      defaultMessage="Oops!"
      defaultDetails="An unexpected error occurred while loading company details."
      customMessages={{
        404: {
          message: "Company Not Found",
          details: "The company you're looking for could not be found.",
        },
        400: {
          message: "Bad Request",
          details: "Company number is required.",
        },
      }}
      actionLinks={[
        { to: "/", label: "Return to Home", variant: "primary" },
        { to: "/search-results", label: "Back to Search", variant: "secondary" },
      ]}
    />
  );
}

export default function CompanyDetails({ loaderData }: Route.ComponentProps) {
  const { companyData, officersData, filingHistoryData, companyDataTranslations } = loaderData;
  const officers = officersData?.items || [];
  const filingHistoryItems = filingHistoryData?.items || [];
  const params = useParams();
  const companyNumber = params.id;
  const location = useLocation();
  const searchQuery = (location.state as { searchQuery?: string })?.searchQuery;
  

  console.log(companyData)
  
  return (
    <>
      <BackButton />
      <div className="space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {companyData.company_name || 'Company Details'}
            </h1>
            {companyData.company_status && (
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                companyData.company_status === 'active' 
                  ? 'bg-green-50 text-green-700' 
                  : companyData.company_status === 'dissolved'
                  ? 'bg-gray-50 text-gray-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                {translateCompanyStatus(companyData.company_status, companyDataTranslations)}
              </span>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Registered Office Address</h3>
                {companyData.registered_office_address ? (
                  <div className="text-sm text-gray-900">
                    {companyData.registered_office_address.address_line_1 && (
                      <p>{companyData.registered_office_address.address_line_1}</p>
                    )}
                    {companyData.registered_office_address.address_line_2 && (
                      <p>{companyData.registered_office_address.address_line_2}</p>
                    )}
                    {companyData.registered_office_address.locality && (
                      <p>{companyData.registered_office_address.locality}</p>
                    )}
                    {companyData.registered_office_address.region && (
                      <p>{companyData.registered_office_address.region}</p>
                    )}
                    {companyData.registered_office_address.postal_code && (
                      <p>{companyData.registered_office_address.postal_code}</p>
                    )}
                    {companyData.registered_office_address.country && (
                      <p>{companyData.registered_office_address.country}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not available</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Company Type</h3>
                <p className="text-sm text-gray-900">
                  {translateCompanyType(companyData.company_type, companyDataTranslations)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Incorporated On</h3>
                <p className="text-sm text-gray-900">
                  {companyData.date_of_creation 
                    ? new Date(companyData.date_of_creation).toLocaleDateString('en-GB', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Not available'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Nature of Business</h3>
                {companyData.sic_codes && companyData.sic_codes.length > 0 ? (
                  <div className="text-sm text-gray-900">
                    {translateSicCodes(companyData.sic_codes, companyDataTranslations).map((description: string, index: number) => (
                      <p key={index}>{description}</p>
                    ))}
                  </div>
                ) : companyData.company_status === 'dissolved' && companyData.previous_company_names ? (
                  <p className="text-sm text-gray-500">Not available</p>
                ) : (
                  <p className="text-sm text-gray-500">Not available</p>
                )}
              </div>
            </div>
          </div>
          
          {officers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Officers ({officersData?.total_results || officers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {officers.map((officer: any, index: number) => (
                  <div
                    key={officer.links?.officer?.appointments || index}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {officer.name || 'Unknown Officer'}
                    </h3>
                    {officer.officer_role && (
                      <p className="text-sm text-gray-600 mb-2">
                        {translateOfficerRole(officer.officer_role, companyDataTranslations)}
                      </p>
                    )}
                    {officer.nationality && (
                      <p className="text-sm text-gray-500 mb-1">
                        Nationality: {officer.nationality}
                      </p>
                    )}
                    {officer.date_of_birth && (
                      <p className="text-sm text-gray-500">
                        Date of Birth: {officer.date_of_birth.year}/{officer.date_of_birth.month || 'XX'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {filingHistoryItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Filing History ({filingHistoryData?.total_count || filingHistoryItems.length})
              </h2>
              <div className="relative pb-6">
                <div className="absolute left-4 top-0 bottom-6 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {filingHistoryItems.slice(0, 10).map((filing: any, index: number) => {
                    const filingDate = filing.date 
                      ? new Date(filing.date).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Date not available';
                    
                    const description = filing.translatedDescription || filing.description || filing.category || 'No description available';
                    
                    return (
                      <div key={filing.transaction_id || index} className="relative pl-12">
                        <div className="absolute left-0 top-1.5 w-8 h-8 flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {filingDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            {description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {(filingHistoryData?.total_count || 0) > 10 && (
                <div className="mt-6 pl-12">
                  <Link
                    to={`/company/${companyNumber}/activity`}
                    state={{ searchQuery }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View more filing history
                  </Link>
                </div>
              )}
            </div>
          )}
      </div>
    </>
  );
}
