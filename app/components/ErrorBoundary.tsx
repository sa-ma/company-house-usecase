import { Link, isRouteErrorResponse } from "react-router";

export interface ErrorBoundaryProps {
  error: unknown;
  defaultMessage?: string;
  defaultDetails?: string;
  customMessages?: {
    404?: { message: string; details: string };
    400?: { message: string; details: string };
    [key: number]: { message: string; details: string } | undefined;
  };
  actionLinks?: Array<{ to: string; label: string; variant?: 'primary' | 'secondary' }>;
}

export function ErrorBoundary({
  error,
  defaultMessage = "Oops!",
  defaultDetails = "An unexpected error occurred.",
  customMessages = {},
  actionLinks = [{ to: "/", label: "Return to Home", variant: "primary" }],
}: ErrorBoundaryProps) {
  let message = defaultMessage;
  let details = defaultDetails;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    const status = error.status;
    
    if (customMessages[status]) {
      message = customMessages[status].message;
      details = customMessages[status].details;
    } else if (status === 404) {
      message = "Not Found";
      details = "The requested resource could not be found.";
    } else if (status === 400) {
      message = "Bad Request";
      details = error.statusText || details;
    } else {
      message = "Error";
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      <h1 className="text-2xl font-semibold text-red-600 mb-4">{message}</h1>
      <p className="text-gray-700 mb-4">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto bg-gray-50 rounded-lg border border-gray-100 text-sm">
          <code>{stack}</code>
        </pre>
      )}
      <div className="mt-6 flex gap-4">
        {actionLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className={`inline-block px-4 py-2 rounded-lg transition-colors duration-200 ${
              link.variant === 'primary'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
