import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import Layout from "@/components/layout";

export default function App({ Component, pageProps }) {
  return (
    <div className={GeistSans.className}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
