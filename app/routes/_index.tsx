
import { Search } from "../components/Search";

export function meta({}) {
  return [
    { title: "Search Companies" },
    { name: "description", content: "Search for UK companies" },
  ];
}

export default function Home() {
  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <Search />
    </div>
  );
}
