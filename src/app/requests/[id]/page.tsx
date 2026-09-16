"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  transitionStatus,
  setResolution,
  addNote,
  removeRequest,
  editDetails,
} from "@/lib/redux/requestsSlice";
import type { ReturnStatus, Resolution } from "@/lib/redux/requestsSlice";
import {
  legalNextStatuses,
  validateResolution,
  isLocked,
  isRemovable,
} from "@/lib/domain/rules";
import StatusBadge from "@/components/StatusBadge";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const request = useAppSelector((state) =>
    state.requests.items.find((r) => r.id === id && !r.removed)
  );
  
  const [noteText, setNoteText] = useState("");
  const [resolution, setResolutionInput] = useState<Resolution | "">("");
  const [refundAmount, setRefundAmount] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Guard with fallbacks so hooks never crash when `request` hasn't loaded yet
  const [editCustomerName, setEditCustomerName] = useState(
    request?.customerName ?? ""
  );
  const [editCustomerEmail, setEditCustomerEmail] = useState(
    request?.customerEmail ?? ""
  );
  const [editItemName, setEditItemName] = useState(
    request?.itemName ?? ""
  );
  const [editQuantity, setEditQuantity] = useState(
    String(request?.quantity ?? 1)
  );
  
  if (!request) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="border rounded-lg p-8 text-center text-gray-500 text-sm bg-white">
          Request not found. It may have been removed.
        </div>
      </main>
    );
  }
  
  // TypeScript now knows this is definitely defined
  const currentRequest = request;
  
  const nextStatuses = legalNextStatuses(currentRequest.status);
  const locked = isLocked(currentRequest.status);
  const removable = isRemovable(currentRequest.status);
  
  function handleSaveEdit() {
    setError("");
  
    if (locked) {
      setError("This request is locked and can no longer be edited.");
      return;
    }
  
    if (
      !editCustomerName.trim() ||
      !editCustomerEmail.trim() ||
      !editItemName.trim()
    ) {
      setError("All fields are required.");
      return;
    }
  
    const qty = Number(editQuantity);
  
    if (!qty || qty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
  
    dispatch(
      editDetails({
        id: currentRequest.id,
        customerName: editCustomerName.trim(),
        customerEmail: editCustomerEmail.trim(),
        itemName: editItemName.trim(),
        quantity: qty,
      })
    );
  
    setIsEditing(false);
  }
  
  function handleTransition(next: ReturnStatus) {
    setError("");
  
    // Approved requires a valid resolution set first
    if (next === "Approved") {
      const result = validateResolution({
        resolution: resolution || null,
        refundAmount:
          resolution === "Refund" ? Number(refundAmount) : null,
      });
  
      if (!result.valid) {
        setError(result.message);
        return;
      }
  
      dispatch(
        setResolution({
          id: currentRequest.id,
          resolution: resolution as Resolution,
          refundAmount:
            resolution === "Refund" ? Number(refundAmount) : null,
        })
      );
    }
  
    dispatch(
      transitionStatus({
        id: currentRequest.id,
        status: next,
      })
    );
  }
  
  function handleAddNote() {
    if (!noteText.trim()) return;
  
    dispatch(
      addNote({
        id: currentRequest.id,
        text: noteText.trim(),
      })
    );
  
    setNoteText("");
  }
  
  function handleRemove() {
    if (
      !confirm(
        "Remove this request from the desk? It stays in storage but won't be listed."
      )
    ) {
      return;
    }
  
    dispatch(removeRequest({ id: currentRequest.id }));
    router.push("/");
  }
  return (
    <main className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.push("/")}
        className="border-1 border-black text-black px-4 py-2 rounded text-sm disabled:opacity-40 font-medium hover:bg-black hover:text-white transition-colors cursor-pointer mb-2"
      >
        ← Back to list
      </button>

      {/* Header card — reference + status shown once */}
      <div className="border rounded-lg p-5 mb-4 bg-white">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-bold font-mono">{request.reference}</h1>
          <StatusBadge status={request.status} />
        </div>

        {!isEditing ? (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Customer</dt>
              <dd>{request.customerName} ({request.customerEmail})</dd>
              <dt className="text-gray-500">Order</dt>
              <dd>{request.orderRef}</dd>
              <dt className="text-gray-500">Item</dt>
              <dd>{request.itemName} ({request.itemSku}) × {request.quantity}</dd>
              <dt className="text-gray-500">Reason</dt>
              <dd>{request.reason}</dd>
              {request.resolution && (
                <>
                  <dt className="text-gray-500">Resolution</dt>
                  <dd>
                    {request.resolution}
                    {request.refundAmount !== null && ` — ₹${request.refundAmount}`}
                  </dd>
                </>
              )}
            </dl>

            <div className="mt-4 pt-4 border-t">
              {locked ? (
                <p className="text-xs text-gray-500">
                  Details are locked — this request has already been decided.
                </p>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="border-1 border-black text-black px-4 py-2 rounded text-sm disabled:opacity-40 font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  Edit details
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer name</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer email</label>
                <input
                  type="email"
                  value={editCustomerEmail}
                  onChange={(e) => setEditCustomerEmail(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item name</label>
                <input
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveEdit}
                className="border-1 border-black text-black px-4 py-2 rounded text-sm disabled:opacity-40 font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="border-1 border-black text-black px-4 py-2 rounded text-sm disabled:opacity-40 font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200 mb-4">
          {error}
        </div>
      )}

      {/* Move request */}
      {nextStatuses.length > 0 && (
        <div className="border rounded-lg p-5 mb-4 bg-white">
          <h2 className="font-semibold mb-3 text-sm text-gray-700">Move request</h2>

          {nextStatuses.includes("Approved") && (
            <div className="flex flex-wrap gap-2 mb-3">
              <select
                value={resolution}
                onChange={(e) => setResolutionInput(e.target.value as Resolution | "")}
                className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Select resolution...</option>
                <option value="Refund">Refund</option>
                <option value="Replacement">Replacement</option>
                <option value="Store Credit">Store Credit</option>
              </select>
              {resolution === "Refund" && (
                <input
                  type="number"
                  placeholder="Refund amount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((next) => (
              <button
                key={next}
                onClick={() => handleTransition(next)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors  cursor-pointer ${
                  next === "Rejected"
                    ? "border border-red-200 text-red-600 hover:bg-red-200"
                    : "border hover:bg-black hover:text-white"
                }`}
              >
                {next === "Rejected" ? "Reject" : `Move to ${next}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Remove */}
      {removable && (
        <div className="mb-4">
          <button
            onClick={handleRemove}
            className="text-sm font-medium text-red-600 border border-red-200 rounded px-3 py-1.5 hover:bg-red-200 transition-colors cursor-pointer"
          >
            Remove from desk
          </button>
        </div>
      )}

      {/* Notes */}
      <div className="border rounded-lg p-5 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-700">Notes</h2>
        <div className="space-y-3 mb-4">
          {request.notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet.</p>
          ) : (
            request.notes.map((n) => (
              <div key={n.id} className="text-sm border-l-2 border-gray-200 pl-3">
                <p className="text-gray-800">{n.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
          />
          <button
            onClick={handleAddNote}
            className="border-1 border-black text-black px-4 py-2 rounded text-sm disabled:opacity-40 font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </main>
  );
}