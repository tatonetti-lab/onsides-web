import { Header } from '~/components/Header';
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ([
  { title: "OnSIDES" },
]);

interface BasePageProps {
    pageInner: React.ReactNode;
}

export const BasePage: React.FC<BasePageProps> = ({ pageInner }) => {
    return (
        <div className="geistsans_81192321-module__keQz_a__className">
            <div className="w-full max-w-7xl mx-auto px-4">
                <Header />
                <main>
                    <div className="my-28" />
                    <div className="flex flex-col gap-8">
                        {/* pageInner is rendered here */}
                        {pageInner}
                    </div>
                    <div className="mt-16">
                        <footer className="w-full py-4">
                            <div className="flex flex-row justify-between items-center flex-wrap gap-4">
                                <div>
                                    <a href="https://tatonettilab.org/">
                                        © 2025 Tatonetti Lab @ Cedars-Sinai Medical Center
                                    </a>
                                </div>
                                <div className="flex flex-wrap items-center space-x-2">
                                    Follow us
                                    <a
                                        href="https://twitter.com/proftatonetti"
                                        className="flex flex-wrap items-center mx-2 gap-1"
                                    >
                                        <img
                                            alt="X Logo"
                                            loading="lazy"
                                            width="14"
                                            height="14"
                                            decoding="async"
                                            style={{ color: 'transparent' }}
                                            src="/x-logo.svg"
                                        />
                                        @proftatonetti
                                    </a>
                                    and
                                    <a
                                        href="https://github.com/tatonetti-lab"
                                        className="flex flex-wrap items-center mx-2 gap-1"
                                    >
                                        <img
                                            alt="GitHub Logo"
                                            loading="lazy"
                                            width="16"
                                            height="16"
                                            decoding="async"
                                            style={{ color: 'transparent' }}
                                            src="/github-logo.svg"
                                        />
                                        @tatonetti-lab
                                    </a>
                                </div>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};