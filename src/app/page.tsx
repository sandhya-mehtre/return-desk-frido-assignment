"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectFilteredRequests, RequestFilters } from "@/lib/redux/selectors";
import type { ReturnStatus, ReturnReason } from "@/lib/redux/requestsSlice";
import StatusBadge from "@/components/StatusBadge";

const STATUSES: (ReturnStatus | "All")[] = [
  "All", "Open", "In Review", "Approved", "Completed", "Rejected",
];
const REASONS: (ReturnReason | "All")[] = [
  "All", "Damaged", "Wrong Item", "Size Issue", "Not As Described", "Changed Mind",
];
const PAGE_SIZE = 10;

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ReturnStatus | "All">("All");
  const [reason, setReason] = useState<ReturnReason | "All">("All");
  const [sortBy, setSortBy] = useState<RequestFilters["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<RequestFilters["sortOrder"]>("desc");
  const [page, setPage] = useState(1);

  // debounce: wait 300ms after typing stops before updating the real filter
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // reset to page 1 whenever a filter changes, so you don't land on an empty page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, reason, sortBy, sortOrder]);

  const filters: RequestFilters = {
    search: debouncedSearch,
    status,
    reason,
    sortBy,
    sortOrder,
    page,
    pageSize: PAGE_SIZE,
  };

  const requestsState = useAppSelector((state) => state);
  const { rows, total } = useMemo(
    () => selectFilteredRequests(requestsState, filters),
    [requestsState, filters]
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isLoading = false; // no async fetch in this version, kept for clarity/future swap

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Link
  href="/requests/new"
  className="border-2 border-black text-black px-4 py-2 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors"
>
  + New Request
</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
  <div className="flex-1 min-w-full sm:min-w-[200px]">
    <label className="block text-xs text-gray-500 mb-1">Search</label>
    <input
      type="text"
      placeholder="Customer, order or reference..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      className="border rounded px-3 py-2 text-sm w-full"
    />
  </div>

  <div>
    <label className="block text-xs text-gray-500 mb-1">Status</label>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value as ReturnStatus | "All")}
      className="border rounded px-3 py-2 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-xs text-gray-500 mb-1">Reason</label>
    <select
      value={reason}
      onChange={(e) => setReason(e.target.value as ReturnReason | "All")}
      className="border rounded px-3 py-2 text-sm"
    >
      {REASONS.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-xs text-gray-500 mb-1">Sort by</label>
    <select
      value={`${sortBy}:${sortOrder}`}
      onChange={(e) => {
        const [by, order] = e.target.value.split(":");
        setSortBy(by as RequestFilters["sortBy"]);
        setSortOrder(order as RequestFilters["sortOrder"]);
      }}
      className="border rounded px-3 py-2 text-sm"
    >
      <option value="createdAt:desc">Newest first</option>
      <option value="createdAt:asc">Oldest first</option>
      <option value="customerName:asc">Customer A-Z</option>
      <option value="status:asc">Status</option>
    </select>
  </div>
</div>

      {/* Table */}
      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="border rounded p-8 text-center text-gray-500 text-sm">
          No requests match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Order</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{r.reference}</td>
                  <td className="p-3">{r.customerName}</td>
                  <td className="p-3">{r.orderRef}</td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-right">
  <Link
    href={`/requests/${r.id}`}
    className="border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-50"
  >
    View
  </Link>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-gray-500">
          Page {page} of {totalPages} · {total} total
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border rounded px-3 py-1 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border rounded px-3 py-1 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}