import { Link } from "react-router";

export function Logo() {
  return (
    <Link to="/" className="block cursor-pointer hover:opacity-80 transition-opacity">
      <svg 
        viewBox="0 0 200 60" 
        className="w-full h-auto max-w-md mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
      <defs>
        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -500;
            }
          }
          .animated-stroke {
            animation: dash 8s linear infinite;
          }
        `}</style>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="48"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fill="none"
        stroke="#d1d4da"
        strokeWidth="0.75"
        className="select-none"
      >
        sama
      </text>
      
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="48"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="0.75"
        strokeDasharray="100 400"
        className="select-none animated-stroke"
      >
        sama
      </text>
    </svg>
    </Link>
  );
}
