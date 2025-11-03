"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasData?: boolean; // ✅ new prop to control visibility
}

export default function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasData = true,
}: AppPaginationProps) {
  // 🛑 Don't show if there are no pages OR no data
  if (!hasData || totalPages <= 1) return null;

  return (
    <Pagination className="mt-4 justify-end">
      <PaginationContent>
        {/* ◀️ Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "cursor-pointer opacity-50" : ""}
          />
        </PaginationItem>

        {/* 🔢 Page numbers */}
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isActive = page === currentPage;

          return (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted"
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* ▶️ Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            className={
              currentPage === totalPages ? "cursor-pointer opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
