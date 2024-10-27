import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Layout({ children }) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <div className="my-28">
                <Navbar />
            </div>
            <main>{children}</main>
            <div className="mt-16">
                <Footer />
            </div>
        </div>
    );
}
