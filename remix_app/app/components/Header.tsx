import { Link } from "@remix-run/react";

export const Header = () => {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 shadow-sm bg-white">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div>
              <svg
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 40 40"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="36" height="36" rx="8" fill="black" />
                <path
                  d="M20 8c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="text-lg">OnSIDES</div>
          </Link>

          <div className="flex gap-2 md:hidden">
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
              aria-label="Toggle Theme"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-moon h-5 w-5 text-foreground"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="mobile-menu"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-menu h-10 w-10"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>

          <nav className="hidden md:flex gap-4">
            <Link to="/" className="font-medium flex items-center text-md transition-colors no-underline">
              Home
            </Link>
            <Link to="/product" className="font-medium flex items-center text-md transition-colors no-underline">
              Drug Products
            </Link>
            <Link to="/ingredient" className="font-medium flex items-center text-md transition-colors no-underline">
              Ingredients
            </Link>
            <Link to="/adverseEffect" className="font-medium flex items-center text-md transition-colors no-underline">
              Adverse Reactions
            </Link>
            <Link to="/download" className="font-medium flex items-center text-md transition-colors no-underline">
              Download
            </Link>
            <a
              href="https://github.com/tatonetti-lab/onsides"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium flex items-center text-md transition-colors no-underline"
            >
              Source Code
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-external-link ml-1 h-4 w-4"
              >
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>

            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
              aria-label="Toggle Theme"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-moon h-5 w-5 text-foreground"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
}
