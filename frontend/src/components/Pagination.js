import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';

import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'

import "./css/pagination.css"

// Example items, to simulate fetching from another resources.


export default function PaginatedItems({ itemsPerPage, ItemsComponent, items }) {
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
    <>

      <ReactPaginate
        breakLabel="..."
        nextLabel={<BsArrowRight/>}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel={<BsArrowLeft/>}
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        activeClassName="pagination-active"
        previousLinkClassName="pagination-arrow"
        nextLinkClassName="pagination-arrow"
      />

      <br />
   
      <ItemsComponent currentItems={currentItems} />
    </>
  );
}