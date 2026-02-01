/**
 * Company House API client utilities
 */

export interface ApiConfig {
  apiKey: string;
  apiUrl: string;
  headers: {
    Authorization: string;
    'Content-Type': string;
  };
}

/**
 * Get API configuration from environment variables
 * @throws Error if API key or URL is not configured
 */
export function getApiConfig(): ApiConfig {
  const apiKey = process.env.COMPANY_HOUSE_API_KEY;
  const apiUrl = process.env.COMPANY_HOUSE_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error("API key or URL not configured");
  }

  const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;

  return {
    apiKey,
    apiUrl,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Create a full API URL from a path
 */
export function createApiUrl(path: string, baseUrl: string): URL {
  return new URL(path, baseUrl);
}

/**
 * Make an authenticated API request
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = getApiConfig();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...config.headers,
      ...options.headers,
    },
  });

  return response;
}
