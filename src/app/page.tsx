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
        <h1 className="text-2xl font-bold">ReturnDesk</h1>
        <Link
          href="/requests/new"
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          + New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search customer, order or reference..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReturnStatus | "All")}
          className="border rounded px-3 py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ReturnReason | "All")}
          className="border rounded px-3 py-2 text-sm"
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
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
                    <Link href={`/requests/${r.id}`} className="text-blue-600 hover:underline">
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
            className="border rounded px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border rounded px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}