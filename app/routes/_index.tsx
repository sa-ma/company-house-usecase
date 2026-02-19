
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search } from "../components/Search";
import {
  getRecentSearches,
  clearRecentSearches,
} from "../lib/recent-searches";

export function meta({}) {
  return [
    { title: "Search Companies" },
    { name: "description", content: "Search for UK companies" },
  ];
}

export default function Home() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleClear = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <Search />
        {recentSearches.length > 0 && (
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                Recent Searches
              </span>
              <button
                onClick={handleClear}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <Link
                  key={search}
                  to={`/search-results?q=${encodeURIComponent(search)}`}
                  className="px-4 py-2 text-sm bg-white rounded-full border border-gray-200 shadow-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-200"
                >
                  {search}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
