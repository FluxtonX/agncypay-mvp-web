"use client";

import React, { useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

export interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  pageSize?: number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = "No records found.",
  emptyAction,
  enableSearch = false,
  searchPlaceholder = "Filter records...",
  searchFilter,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) return data;
    if (searchFilter) {
      return data.filter((row) => searchFilter(row, searchQuery));
    }
    // Generic text search across all values
    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, enableSearch, searchQuery, searchFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumnId) return filteredData;
    const col = columns.find((c) => c.id === sortColumnId);
    if (!col || !col.accessorKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[col.accessorKey!];
      const bVal = b[col.accessorKey!];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortColumnId, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortColumnId === columnId) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortColumnId(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumnId(columnId);
      setSortDirection("asc");
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Optional Search Toolbar */}
      {enableSearch && (
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {sortedData.length} records
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {columns.map((col) => {
                const isSorted = sortColumnId === col.id;
                return (
                  <th
                    key={col.id}
                    onClick={() => handleSort(col.id, col.sortable)}
                    style={{ width: col.width }}
                    className={cn(
                      "py-3 px-4 font-semibold select-none",
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left",
                      col.sortable &&
                        "cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`}>
                  {columns.map((col) => (
                    <td key={col.id} className="py-3.5 px-4">
                      <Skeleton className="h-4 w-full max-w-[120px] rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-400 space-y-2"
                >
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {emptyMessage}
                  </div>
                  {emptyAction && <div className="pt-2">{emptyAction}</div>}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowKey = keyExtractor(row);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "py-3.5 px-4 text-slate-700 dark:text-slate-300",
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left"
                        )}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && sortedData.length > pageSize && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
