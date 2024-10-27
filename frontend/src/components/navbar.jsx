import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
    const links = [
        { href: "/", label: "Home" },
        { href: "/drug-list", label: "Drugs" },
        { href: "/adverse-list", label: "Adverse Reactions" },
        { href: "/download", label: "Download" },
        {
            href: "https://github.com/tatonetti-lab/onsides",
            label: "Source Code",
            isExternal: true
        },
    ];

    return (
        <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm dark:bg-gray-950/90">
            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 no-underline">
                        <OnsidesIcon className="h-8 w-8" />
                        <div className="text-lg">OnSIDES</div>
                    </Link>
                    {/* Desktop nav */}
                    <nav className="hidden md:flex gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="font-medium flex items-center text-md transition-colors no-underline"
                                {...(link.isExternal && {
                                    target: "_blank",
                                    rel: "noopener noreferrer"
                                })}
                            >
                                {link.label}
                                {link.isExternal && (
                                    <ExternalLink className="ml-1 h-4 w-4" />
                                )}
                            </Link>
                        ))}
                    </nav>
                    {/* Mobile nav */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Menu className="h-10 w-10" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white dark:bg-gray-950 border-l">
                            <nav className="flex flex-col gap-4 mt-8">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="font-medium text-lg py-2 hover:text-gray-600 transition-colors no-underline flex items-center"
                                        {...(link.isExternal && {
                                            target: "_blank",
                                            rel: "noopener noreferrer"
                                        })}
                                    >
                                        {link.label}
                                        {link.isExternal && (
                                            <ExternalLink className="ml-1 h-4 w-4" />
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}

function OnsidesIcon(props) {
    return (
        <div>
            <svg
                {...props}
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
    );
}
