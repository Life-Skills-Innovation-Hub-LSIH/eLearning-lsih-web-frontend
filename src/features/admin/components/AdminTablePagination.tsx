"use client";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/admin/shadcn";

export const ADMIN_PAGE_SIZE_OPTIONS = [30, 50, 100] as const;
export type AdminPageSize = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_ADMIN_PAGE_SIZE: AdminPageSize = 30;

type Props = {
  page: number;
  pageSize: AdminPageSize;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: AdminPageSize) => void;
};

export function AdminTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Showing {from}–{to} of {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              onPageSizeChange(Number(value) as AdminPageSize);
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-8 w-[88px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Page {safePage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((pageNumber) => {
              if (totalPages <= 7) return true;
              if (pageNumber === 1 || pageNumber === totalPages) return true;
              return Math.abs(pageNumber - safePage) <= 1;
            })
            .map((pageNumber, index, list) => {
              const prev = list[index - 1];
              const showEllipsis = prev != null && pageNumber - prev > 1;
              return (
                <span key={pageNumber} className="flex items-center gap-1">
                  {showEllipsis ? (
                    <span className="px-1 text-muted-foreground">…</span>
                  ) : null}
                  <Button
                    type="button"
                    variant={pageNumber === safePage ? "secondary" : "ghost"}
                    size="sm"
                    className="min-w-8"
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </span>
              );
            })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return items.slice((safePage - 1) * pageSize, safePage * pageSize);
}
