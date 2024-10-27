import Image from "next/image";
import React from "react";

export default function Footer() {
    return (
        <footer className="w-full py-4">
            <div className="flex flex-row justify-between items-center flex-wrap gap-4">
                <div className="">
                    <a
                        href="https://tatonettilab.org/"
                    >
                        © 2024 Tatonetti Lab @ Cedars-Sinai Medical Center
                    </a>
                </div>
                <div className="flex flex-wrap items-center space-x-2">
                    Follow us
                    <a
                        href="https://twitter.com/proftatonetti"
                        className="flex flex-wrap items-center mx-2 gap-1"
                    >
                        <Image src="/x-logo.svg" alt="X Logo" width={14} height={14} />
                        @proftatonetti
                    </a>
                    and
                    <a
                        href="https://github.com/tatonetti-lab"
                        className="flex flex-wrap items-center mx-2 gap-1"
                    >
                        <Image src="/github-logo.svg" alt="GitHub Logo" width={16} height={16} />
                        @tatonetti-lab
                    </a>
                </div>
            </div>
        </footer>
    );
}
