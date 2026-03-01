import { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortDirection = "asc" | "desc";

interface SortState {
  column: string | null;
  direction: SortDirection;
}

const DATE_COLUMNS = new Set([
  "created_at", "updated_at", "publish_date", "event_date", "end_date",
  "album_date", "date", "start_date",
]);

export function useTableSort<T>(items: T[]) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" });

  const toggleSort = useCallback((column: string) => {
    setSort((prev) => {
      if (prev.column !== column) return { column, direction: "asc" };
      if (prev.direction === "asc") return { column, direction: "desc" };
      return { column: null, direction: "asc" }; // reset
    });
  }, []);

  const sorted = useMemo(() => {
    if (!sort.column) return items;

    return [...items].sort((a: any, b: any) => {
      let aVal = a[sort.column!];
      let bVal = b[sort.column!];

      // Nulls last
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Date columns
      if (DATE_COLUMNS.has(sort.column!)) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
        return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Strings
      const cmp = String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [items, sort]);

  return { sorted, sort, toggleSort };
}

interface SortableHeadProps {
  column: string;
  label: string;
  sort: SortState;
  onSort: (column: string) => void;
  className?: string;
}

export function SortableHead({ column, label, sort, onSort, className }: SortableHeadProps) {
  const isActive = sort.column === column;

  return (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground transition-colors ${className || ""}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          sort.direction === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5 text-primary" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-primary" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
        )}
      </div>
    </TableHead>
  );
}
