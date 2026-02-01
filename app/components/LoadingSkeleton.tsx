import { Search } from "./Search";

export interface LoadingSkeletonProps {
  variant?: 'default' | 'search-results' | 'company-details';
  children?: React.ReactNode;
}

export function LoadingSkeleton({ variant = 'default', children }: LoadingSkeletonProps) {
  if (children) {
    return <>{children}</>;
  }

  switch (variant) {
    case 'search-results':
      return (
        <>
          <div className="mb-12">
            <Search />
          </div>
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );

    case 'company-details':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      );
  }
}
