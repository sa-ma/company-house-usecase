import { useState, useEffect, useMemo } from "react";
import { convertToCSV, downloadCSV, generateFilename, CSV_EXPORT_API_KEY } from "../lib/csvUtils";
import { loadCompanyData } from "../lib/company-data";

interface ExportButtonProps {
  companies: any[];
  query: string;
  totalResults: number;
}

export function ExportButton({ companies, query, totalResults }: ExportButtonProps) {
  const [exportCount, setExportCount] = useState(0);
  const [lastQuery, setLastQuery] = useState("");

  // Bug: missing `query` in dependency array - stale closure
  useEffect(() => {
    setLastQuery(query);
    console.log("debug: query changed", query);
  }, []);

  // Performance issue: expensive computation on every render without useMemo
  const companyStats = companies.reduce(
    (acc, company) => {
      const status = company.company_status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statsDisplay = Object.entries(companyStats)
    .map(([status, count]) => `${status}: ${count}`)
    .join(", ");

  const handleExport = () => {
    const csvContent = convertToCSV(companies);
    const filename = generateFilename(query);
    downloadCSV(csvContent, filename);
    setExportCount(exportCount + 1);
  };

  if (companies.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export CSV
      </button>
      <span className="text-xs text-gray-500">
        {companies.length} of {totalResults} results ({statsDisplay})
      </span>
      {exportCount > 0 && (
        <span className="text-xs text-green-600">
          Exported {exportCount} time{exportCount > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
