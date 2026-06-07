"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_VISIBLE_PAGE_BUTTONS = 5;

function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number,
) {
  if (totalPages < 1) {
    return [];
  }

  const visibleCount = Math.min(maxVisiblePages, totalPages);
  const halfWindow = Math.floor(visibleCount / 2);

  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = startPage + visibleCount - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - visibleCount + 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel,
  className,
  maxVisiblePages = DEFAULT_MAX_VISIBLE_PAGE_BUTTONS,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
  className?: string;
  maxVisiblePages?: number;
}) {
  const safeTotalPages = Math.max(0, Math.floor(totalPages));

  if (safeTotalPages <= 1) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(1, Math.floor(currentPage)),
    safeTotalPages,
  );
  const visiblePageNumbers = getVisiblePageNumbers(
    safeCurrentPage,
    safeTotalPages,
    Math.max(1, Math.floor(maxVisiblePages)),
  );
  const hasPreviousPage = safeCurrentPage > 1;
  const hasNextPage = safeCurrentPage < safeTotalPages;

  function goToPage(page: number) {
    onPageChange(Math.min(Math.max(1, page), safeTotalPages));
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex items-center justify-center gap-2.5 pt-2", className)}
    >
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={!hasPreviousPage}
        aria-label="Go to previous page"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-[#17243b] transition focus-visible:ring-2 focus-visible:ring-[#17243b]/25 focus-visible:ring-offset-2 focus-visible:outline-none",
          !hasPreviousPage
            ? "cursor-not-allowed opacity-35"
            : "hover:-translate-x-0.5 hover:text-[#0f1728]",
        )}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
      </button>

      {visiblePageNumbers.map((pageNumber) => {
        const isActive = pageNumber === safeCurrentPage;

        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => goToPage(pageNumber)}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium text-[#17243b] shadow-[0_2px_4px_rgba(23,36,59,0.1)] transition focus-visible:ring-2 focus-visible:ring-[#17243b]/25 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive
                ? "border-[#ef9322] bg-[#ef9322] text-[#17243b]"
                : "border-[#d4d8de] bg-white hover:-translate-y-0.5 hover:border-[#17243b]",
            )}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Go to next page"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-[#17243b] transition focus-visible:ring-2 focus-visible:ring-[#17243b]/25 focus-visible:ring-offset-2 focus-visible:outline-none",
          !hasNextPage
            ? "cursor-not-allowed opacity-35"
            : "hover:translate-x-0.5 hover:text-[#0f1728]",
        )}
      >
        <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
      </button>
    </nav>
  );
}
