export function generatePageNumbers(page, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (page > 3) {
    pages.push("...");
  }
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  ) {
    pages.push(i);
  }
  if (page < totalPages - 2) {
    pages.push("...");
  }
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  return pages;
}
