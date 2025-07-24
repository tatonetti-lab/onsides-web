import DrugsPage from "@/components/drugs-page";

export default async function ProductsPage({ searchParams }) {
  console.log("ProductsPage searchParams:", searchParams);
  return <DrugsPage pathName={"product"} searchParams={searchParams} />;
}
