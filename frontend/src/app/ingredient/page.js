import DrugsPage from "@/components/drugs-page";

export default async function IngredientsPage({ searchParams }) {
  return <DrugsPage pathName={"ingredient"} searchParams={searchParams} />;
}
