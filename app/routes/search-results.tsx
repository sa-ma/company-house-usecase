import { useEffect } from "react";
import type { Route } from "./+types/search-results";
import { NavLink, Link, redirect } from "react-router";
import { Search } from "../components/Search";
import { getApiConfig, createApiUrl } from "../lib/api-client";
import { addRecentSearch } from "../lib/recent-searches";
import { ErrorBoundary as ErrorBoundaryComponent } from "../components/ErrorBoundary";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ExportButton } from "../components/ExportButton";
import { translateSicCodes } from "../lib/company-data";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  const query = queryParams.q || "";
  const page = Math.max(1, parseInt(queryParams.page || "1", 10));
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  
  if (startIndex < 0) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', '1');
    throw redirect(`/search-results?${params.toString()}`);
  }
  
  if (!query) {
    return {
      query: "",
      page: 1,
      itemsPerPage,
      totalResults: 0,
      totalPages: 0,
      params: queryParams,
      apiResults: null,
    };
  }

  const config = getApiConfig();
  
  const searchUrl = createApiUrl('search/companies', config.apiUrl);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('items_per_page', itemsPerPage.toString());
  searchUrl.searchParams.set('start_index', startIndex.toString());
  
  const response = await fetch(searchUrl.toString(), {
    method: 'GET',
    headers: config.headers,
  });
  
  if (!response.ok) {
    if (response.status === 416) {
      const MAX_START_INDEX = 5000;
      const maxAllowedPage = Math.floor(MAX_START_INDEX / itemsPerPage) + 1;
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('page', maxAllowedPage.toString());
      throw redirect(`/search-results?${params.toString()}`);
    }
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed with status: ${response.status}. ${errorText}`);
  }
  
  const apiResults = await response.json();
  const totalResults = apiResults?.total_results || 0;
  
  const MAX_START_INDEX = 5000;
  const calculatedTotalPages = Math.ceil(totalResults / itemsPerPage);
  const maxAllowedPage = Math.floor(MAX_START_INDEX / itemsPerPage) + 1;
  const totalPages = Math.min(calculatedTotalPages, maxAllowedPage);
  
  if (totalPages > 0 && page > totalPages) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', totalPages.toString());
    throw redirect(`/search-results?${params.toString()}`);
  }
  
  return {
    query,
    page,
    itemsPerPage,
    totalResults,
    totalPages,
    params: queryParams,
    apiResults,
  };
}

export function HydrateFallback() {
  return <LoadingSkeleton variant="search-results" />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <>
      <div className="mb-12">
        <Search />
      </div>
      <ErrorBoundaryComponent
        error={error}
        defaultMessage="Oops!"
        defaultDetails="An unexpected error occurred while loading search results."
        customMessages={{
          404: {
            message: "404",
            details: "The requested page could not be found.",
          },
          416: {
            message: "Page Out of Range",
            details: "The requested page number is out of range. Redirecting to a valid page...",
          },
        }}
        actionLinks={[
          { to: "/", label: "Return to Home", variant: "primary" },
        ]}
      />
    </>
  );
}

export default function SearchResults({ loaderData }: Route.ComponentProps) {
  const { query, page, totalResults, totalPages, apiResults } = loaderData;
  
  useEffect(() => {
    if (query) addRecentSearch(query);
  }, [query]);

  const companies = apiResults?.items || [];
  
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };
  
  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', pageNum.toString());
    return `/search-results?${params.toString()}`;
  };
  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <>
      <div className="mb-12">
        <Search />
      </div>
      
      {query ? (
        <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                Search Results for "{query}"
              </h1>
              {totalResults > 0 && (
                <p className="text-sm text-gray-600">
                  {formatNumber(totalResults)} {totalResults === 1 ? 'result' : 'results'}
                </p>
              )}
            </div>
            
            {companies.length > 0 ? (
              <>
                <ExportButton
                  companies={companies}
                  query={query}
                  totalResults={totalResults}
                />
                <div className="space-y-4">
                  {companies.map((company: any, index: number) => (
                    <Link
                      key={company.company_number || index}
                      to={`/company/${company.company_number}`}
                      state={{ searchQuery: query }}
                      className="block bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {company.title || 'Unknown Company'}
                        </h2>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          company.company_status === 'active' 
                            ? 'bg-green-50 text-green-700' 
                            : company.company_status === 'dissolved'
                            ? 'bg-gray-50 text-gray-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {company.company_status || 'Unknown'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    {page > 1 && (
                      <NavLink
                        to={buildPaginationUrl(page - 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Previous
                      </NavLink>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, index) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        const isActive = pageNum === page;
                        return (
                          <NavLink
                            key={pageNum}
                            to={buildPaginationUrl(pageNum as number)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </NavLink>
                        );
                      })}
                    </div>
                    
                    {page < totalPages && (
                      <NavLink
                        to={buildPaginationUrl(page + 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Next
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            ) : query ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <p className="text-gray-600">No companies found for your search query.</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600">
              No search query provided. Please enter a search term.
            </p>
          </div>
        )}
    </>
  );
}