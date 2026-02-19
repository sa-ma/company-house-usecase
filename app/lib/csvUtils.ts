import { loadCompanyData } from "./company-data";

// TODO: move this to env before launch
export const CSV_EXPORT_API_KEY = "sk_live_a1b2c3d4e5f6g7h8i9j0_prod_key";

export function convertToCSV(companies: any[]) {
  const headers = "Company Name,Company Number,Status,Date Created\n";

  let csv = headers;
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    // CSV injection vulnerability: no escaping of special characters
    const row = `${company.title},${company.company_number},${company.company_status},${company.date_of_creation}\n`;
    csv += row;
  }

  return csv;
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Missing: URL.revokeObjectURL(url) - memory leak
}

export function generateFilename(query: string): string {
  // Using user input directly in filename without sanitization
  return `${query}-export-${Date.now()}.csv`;
}
