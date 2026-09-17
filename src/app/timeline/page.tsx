"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/hooks";
import StatusBadge from "@/components/StatusBadge";
import type { ReturnStatus } from "@/lib/redux/requestsSlice";

interface FeedEntry {
  id: string;
  requestId: string;
  reference: string;
  customerName: string;
  fromStatus: ReturnStatus | null;
  toStatus: ReturnStatus;
  changedAt: string;
}

type DetailEntry =
  | { kind: "status"; id: string; fromStatus: ReturnStatus | null; toStatus: ReturnStatus; at: string }
  | { kind: "note"; id: string; text: string; at: string };

export default function TimelinePage() {
  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-1">Timeline</h1>
      <p className="text-sm text-gray-500 mb-4">
        Search a specific request&apos;s history, or browse recent activity
        across every request.
      </p>

      <div className="flex flex-col lg:flex-row gap-4">        <div className="lg:w-1/2">
          <SearchBlock />
        </div>
        <div className="lg:w-1/2">
          <RecentFeedBlock />
        </div>
      </div>
    </main>
  );
}

// ---- Left/top block: search a specific request's full history ----
function SearchBlock() {
  const requests = useAppSelector((state) => state.requests.items);
  const [searchInput, setSearchInput] = useState("");
  const term = searchInput.trim().toLowerCase();

  const matched = term
    ? requests.find(
        (r) =>
          !r.removed &&
          (r.reference.toLowerCase().includes(term) ||
            r.orderRef.toLowerCase().includes(term))
      )
    : null;

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold text-sm mb-3">Look up a request</h2>

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">
          Search by reference or order ID
        </label>
        <input
          type="text"
          placeholder="e.g. RD-2026-0001 or ORD-1000"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />
      </div>

      {!term ? (
        <p className="text-sm text-gray-400 text-center py-6">
          Enter a reference or order ID to see its full timeline.
        </p>
      ) : !matched ? (
        <div className="border rounded p-6 text-center text-gray-500 text-sm">
          No request found matching &quot;{searchInput}&quot;.
        </div>
      ) : (
        <RequestDetailTimeline requestId={matched.id} />
      )}
    </div>
  );
}

function RequestDetailTimeline({ requestId }: { requestId: string }) {
  const request = useAppSelector((state) =>
    state.requests.items.find((r) => r.id === requestId)
  );

  if (!request) return null;

  const statusEntries: DetailEntry[] = (request.statusHistory ?? []).map((h) => ({
    kind: "status",
    id: h.id,
    fromStatus: h.fromStatus,
    toStatus: h.toStatus,
    at: h.changedAt,
  }));

  const noteEntries: DetailEntry[] = (request.notes ?? []).map((n) => ({
    kind: "note",
    id: n.id,
    text: n.text,
    at: n.createdAt,
  }));

  const merged = [...statusEntries, ...noteEntries].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return (
    <div>
      <div className="border rounded p-3 mb-3 flex justify-between items-start">
        <div className="min-w-0">
          <Link
            href={`/requests/${request.id}`}
            className="font-mono text-xs text-blue-600 hover:underline"
          >
            {request.reference}
          </Link>
          <p className="text-sm truncate">{request.customerName}</p>
          <p className="text-xs text-gray-500">Order: {request.orderRef}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {merged.length === 0 ? (
        <div className="border rounded p-6 text-center text-gray-500 text-sm">
          No history yet for this request.
        </div>
      ) : (
        <ul className="space-y-2 max-h-[28rem] overflow-y-auto">
          {merged.map((entry) => (
            <li key={entry.id} className="border rounded p-3">
              {entry.kind === "status" ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    {entry.fromStatus && (
                      <>
                        <StatusBadge status={entry.fromStatus} />
                        <span className="text-gray-400 text-xs">→</span>
                      </>
                    )}
                    <StatusBadge status={entry.toStatus} />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.at).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Note
                  </p>
                  <p className="text-sm">{entry.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.at).toLocaleString()}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- Right/bottom block: cross-request recent activity feed ----
function RecentFeedBlock() {
  const requests = useAppSelector((state) => state.requests.items);

  const feed: FeedEntry[] = requests
    .filter((r) => !r.removed)
    .flatMap((r) =>
      (r.statusHistory ?? []).map((h) => ({
        id: h.id,
        requestId: r.id,
        reference: r.reference,
        customerName: r.customerName,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedAt: h.changedAt,
      }))
    )
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold text-sm mb-3">Recent status changes</h2>

      {feed.length === 0 ? (
        <div className="border rounded p-6 text-center text-gray-500 text-sm">
          No activity yet.
        </div>
      ) : (
        <ul className="space-y-2 max-h-[32rem] overflow-y-auto">
          {feed.map((entry) => (
            <li
              key={entry.id}
              className="border rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div className="min-w-0">
                <Link
                  href={`/requests/${entry.requestId}`}
                  className="font-mono text-xs text-blue-600 hover:underline"
                >
                  {entry.reference}
                </Link>
                <p className="text-sm truncate">{entry.customerName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.changedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {entry.fromStatus && (
                  <>
                    <StatusBadge status={entry.fromStatus} />
                    <span className="text-gray-400 text-xs">→</span>
                  </>
                )}
                <StatusBadge status={entry.toStatus} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}