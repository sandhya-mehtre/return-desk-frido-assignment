import type { RootState } from "./store";
import type { ReturnRequest, ReturnStatus, ReturnReason } from "./requestsSlice";

export interface RequestFilters {
  search: string;
  status: ReturnStatus | "All";
  reason: ReturnReason | "All";
  sortBy: "createdAt" | "updatedAt" | "customerName" | "status";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function selectVisibleRequests(state: RootState): ReturnRequest[] {
  return state.requests.items.filter((r) => !r.removed);
}

function matchesSearch(r: ReturnRequest, term: string): boolean {
  if (!term) return true;
  const t = term.toLowerCase();
  return (
    r.customerName.toLowerCase().includes(t) ||
    r.orderRef.toLowerCase().includes(t) ||
    r.reference.toLowerCase().includes(t)
  );
}

export function selectFilteredRequests(
  state: RootState,
  filters: RequestFilters
): { rows: ReturnRequest[]; total: number } {
  let rows = selectVisibleRequests(state);

  if (filters.status !== "All") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters.reason !== "All") {
    rows = rows.filter((r) => r.reason === filters.reason);
  }
  if (filters.search.trim()) {
    rows = rows.filter((r) => matchesSearch(r, filters.search.trim()));
  }

  rows = [...rows].sort((a, b) => {
    const dir = filters.sortOrder === "asc" ? 1 : -1;
    const av = a[filters.sortBy];
    const bv = b[filters.sortBy];
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  const total = rows.length;
  const start = (filters.page - 1) * filters.pageSize;
  const paged = rows.slice(start, start + filters.pageSize);

  return { rows: paged, total };
}