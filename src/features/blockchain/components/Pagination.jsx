function Pagination({ pageInfo, onPageChange }) {
  const { page, totalPages } = pageInfo;
  const MAX_VISIBLE_PAGES = 10;

  if (totalPages <= 1) {
    return null;
  }

  let startPage = Math.max(1, page - Math.floor(MAX_VISIBLE_PAGES / 2));
  let endPage = startPage + MAX_VISIBLE_PAGES - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        이전
      </button>

      {pages.map((item) => (
        <button
          type="button"
          key={item}
          className={`pagination__button ${item === page ? "is-active" : ""}`}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        className="pagination__button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        다음
      </button>
    </div>
  );
}

export default Pagination;
