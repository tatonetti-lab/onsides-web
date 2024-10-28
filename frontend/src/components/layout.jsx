import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Layout({ children }) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <main>
                <div className="my-28">
                    <Navbar />
                </div>
                {children}
                <div className="mt-16">
                    <Footer />
                </div>
            </main>
        </div>
    );
}
