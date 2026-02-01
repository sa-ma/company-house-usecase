import type { Route } from "./+types/company.$id.activity";
import { useFetcher } from "react-router";
import { getApiConfig, createApiUrl } from "../lib/api-client";
import { ErrorBoundary as ErrorBoundaryComponent } from "../components/ErrorBoundary";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { BackButton } from "../components/BackButton";
import { useState, useEffect } from "react";
import filingHistoryEnumData from "../data/filing-history-enum.json";

const ITEMS_PER_PAGE = 50;

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

  const config = getApiConfig();
  
  const companyUrl = createApiUrl(`company/${companyNumber}`, config.apiUrl);
  const companyResponse = await fetch(companyUrl.toString(), {
    method: 'GET',
    headers: config.headers,
  });
  
  if (!companyResponse.ok) {
    if (companyResponse.status === 404) {
      throw new Response("Company not found", { status: 404 });
    }
    const errorText = await companyResponse.text().catch(() => 'Unknown error');
    throw new Error(`API request failed with status: ${companyResponse.status}. ${errorText}`);
  }
  
  const companyData = await companyResponse.json();
  
  const filingHistoryUrl = createApiUrl(`company/${companyNumber}/filing-history`, config.apiUrl);
  filingHistoryUrl.searchParams.set('items_per_page', ITEMS_PER_PAGE.toString());
  filingHistoryUrl.searchParams.set('start_index', '0');
  
  const filingHistoryResponse = await fetch(filingHistoryUrl.toString(), {
    method: 'GET',
    headers: config.headers,
  });
  
  let filingHistoryData = null;
  if (filingHistoryResponse.ok) {
    const pageData = await filingHistoryResponse.json();
    const totalCount = pageData.total_count || 0;
    
    const translatedItems = (pageData.items || []).map((filing: any) => ({
      ...filing,
      translatedDescription: translateFilingDescription(
        filing.description,
        filing.description_values,
        filingHistoryEnum
      )
    }));
    
    filingHistoryData = {
      items: translatedItems,
      total_count: totalCount,
    };
  } else {
    console.warn(`Failed to fetch filing history: ${filingHistoryResponse.status}`);
  }
  
  return {
    companyData,
    filingHistoryData,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const companyNumber = params.id;
  
  if (!companyNumber) {
    throw new Response("Company number is required", { status: 400 });
  }

  const formData = await request.formData();
  const startIndex = parseInt(formData.get("startIndex") as string, 10);

  const filingHistoryEnum = loadFilingHistoryEnum();

  const config = getApiConfig();
  
  const filingHistoryUrl = createApiUrl(`company/${companyNumber}/filing-history`, config.apiUrl);
  filingHistoryUrl.searchParams.set('items_per_page', ITEMS_PER_PAGE.toString());
  filingHistoryUrl.searchParams.set('start_index', startIndex.toString());
  
  const filingHistoryResponse = await fetch(filingHistoryUrl.toString(), {
    method: 'GET',
    headers: config.headers,
  });
  
  if (!filingHistoryResponse.ok) {
    throw new Error(`Failed to fetch filing history: ${filingHistoryResponse.status}`);
  }
  
  const pageData = await filingHistoryResponse.json();
  
  const translatedItems = (pageData.items || []).map((filing: any) => ({
    ...filing,
    translatedDescription: translateFilingDescription(
      filing.description,
      filing.description_values,
      filingHistoryEnum
    )
  }));
  
  return {
    items: translatedItems,
    total_count: pageData.total_count || 0,
  };
}

export function meta() {
  return [
    { title: "Company Filing History" },
    { name: "description", content: "View company filing history" },
  ];
}

export function HydrateFallback() {
  return <LoadingSkeleton variant="company-details" />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <ErrorBoundaryComponent
      error={error}
      defaultMessage="Oops!"
      defaultDetails="An unexpected error occurred while loading filing history."
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
      ]}
    />
  );
}

export default function CompanyActivity({ loaderData }: Route.ComponentProps) {
  const { companyData, filingHistoryData } = loaderData;
  const fetcher = useFetcher<typeof action>();
  
  const [allItems, setAllItems] = useState(filingHistoryData?.items || []);
  const [currentStartIndex, setCurrentStartIndex] = useState(ITEMS_PER_PAGE);
  const totalCount = filingHistoryData?.total_count || 0;
  
  useEffect(() => {
    if (fetcher.data?.items) {
      setAllItems((prev: any[]) => [...prev, ...fetcher.data!.items]);
    }
  }, [fetcher.data]);
  
  const handleLoadMore = () => {
    fetcher.submit(
      { startIndex: currentStartIndex.toString() },
      { method: "post" }
    );
    setCurrentStartIndex(prev => prev + ITEMS_PER_PAGE);
  };
  
  const hasMore = currentStartIndex < totalCount;
  const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";
  
  return (
    <>
      <BackButton />
      
      <div className="space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {companyData.company_name || 'Company Details'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Filing History</p>
            </div>
          </div>
          
          {allItems.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                All Filing History ({totalCount})
              </h2>
              <div className="relative pb-6">
                <div className="absolute left-4 top-0 bottom-6 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {allItems.map((filing: any, index: number) => {
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
              
              {hasMore && (
                <div className="mt-6 pl-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline"
                  >
                    {isLoading ? "Loading..." : "View more filing history"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <p className="text-gray-600">No filing history available.</p>
            </div>
          )}
      </div>
    </>
  );
}
