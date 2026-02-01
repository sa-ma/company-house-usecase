import { useNavigate, useLocation } from "react-router";

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const pathname = location.pathname;
    
    const companyMatch = pathname.match(/^\/company\/([^/]+)/);
    const companyId = companyMatch?.[1];
    const isActivityPage = pathname.endsWith("/activity");
    const searchQuery = (location.state as { searchQuery?: string })?.searchQuery;

    if (isActivityPage && companyId) {
      navigate(`/company/${companyId}`, { state: { searchQuery } });
      return;
    }

    if (companyId && !isActivityPage) {
      if (searchQuery) {
        navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate("/search-results");
      }
      return;
    }
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleBack}
        className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-1 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
}
