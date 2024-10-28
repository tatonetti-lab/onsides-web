import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import Layout from "@/components/layout";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <div className={GeistSans.className}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </ThemeProvider>
  );
}
