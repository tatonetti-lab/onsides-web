import { GeistSans } from "geist/font/sans";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "../styles/globals.css";

export const metadata = {
  title: "OnSIDES",
  description: "Database of drug adverse events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={GeistSans.className}>
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
        </div>
      </body>
    </html>
  );
}
