import DrugsPage from "@/components/drugs-page";

export default async function ProductsPage({ searchParams }) {
  return <DrugsPage pathName={"product"} searchParams={searchParams} />;
}
