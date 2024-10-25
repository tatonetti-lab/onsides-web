import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

// Example items, to simulate fetching from another resources.

export default function PaginatedItems({
  itemsPerPage,
  ItemsComponent,
  items,
}) {
  // We start with an empty list of items.
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(items.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, items]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <div>
      <ReactPaginate
        breakLabel="..."
        nextLabel={<BsArrowRight className="h-4 w-4" />}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel={<BsArrowLeft className="h-4 w-4" />}
        renderOnZeroPageCount={null}
        className="flex items-center justify-center gap-2 my-4"
        pageClassName="flex items-center justify-center"
        pageLinkClassName="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors no-underline"
        activeClassName="bg-neutral-800 rounded-md [&>a]:hover:bg-neutral-700 [&>a]:transition-colors"
        activeLinkClassName="text-white hover:!text-white no-underline"
        previousClassName="flex items-center justify-center"
        nextClassName="flex items-center justify-center"
        previousLinkClassName="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors text-neutral-800 no-underline"
        nextLinkClassName="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors text-neutral-800 no-underline"
        disabledClassName="opacity-50 cursor-not-allowed"
        breakClassName="flex items-center justify-center"
        breakLinkClassName="flex items-center justify-center w-8 h-8 no-underline"
      />
      <br />

      <ItemsComponent currentItems={currentItems} />
    </div>
  );
}

