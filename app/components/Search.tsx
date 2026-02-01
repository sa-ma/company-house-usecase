import { Form } from "react-router";

export function Search() {
  return (
    <Form method="get" action="/search-results" className="w-full max-w-4xl mx-auto">
      <div className="flex shadow-xl rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-0 transition-all duration-200">
        <input
          type="text"
          name="q"
          placeholder="Search for a UK company..."
          className="flex-1 px-5 py-4 text-lg text-gray-900 bg-white border-0 focus:outline-none focus:ring-0"
          required
        />
        <button
          type="submit"
          className="px-6 py-4 text-lg bg-blue-600 text-white font-medium border-0 rounded-full hover:bg-blue-700 focus:outline-none transition-colors duration-200"
        >
          Search
        </button>
      </div>
    </Form>
  );
}
