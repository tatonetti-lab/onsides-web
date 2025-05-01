"use client";

import PageNumbers from "@/components/server-table/page-numbers";
import InnerTable from "@/components/server-table/inner-table";
import FilterBox from "@/components/server-table/filter-box";

/**
 * Filter-able, sort-able, paginated table.
 * This is a "server table" in the sense that all filtering is actually done
 * server-side, not on the client. This is needed because we now have too
 * many rows in some cases, and we don't want to send them all to the client
 * every time.
 * The pathname must take the following search parameters:
 * "sort", "order" - For sorting (e.g. "?sort=name&order=asc").
 *     sort: "name"/"id", order: "asc"/"desc"
 * "name", "id" - For string searching (e.g. "?name=naproxe")
 * "page" - For pagination (e.g. "?page=1")
 */
export default function ServerTable({
  items,
  nTotalItems,
  displayName = "name",
  displayId = "ID",
}) {
  const nPages = Math.ceil(nTotalItems / 10);
  return (
    <>
      <FilterBox displayName={displayName} displayId={displayId} />
      <InnerTable items={items} />
      <PageNumbers nPages={nPages} />
    </>
  );
}
