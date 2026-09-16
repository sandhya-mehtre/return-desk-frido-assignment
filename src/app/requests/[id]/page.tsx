"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  transitionStatus,
  setResolution,
  addNote,
  removeRequest,
} from "@/lib/redux/requestsSlice";
import type { ReturnStatus, Resolution } from "@/lib/redux/requestsSlice";
import {
  legalNextStatuses,
  validateResolution,
  isLocked,
  isRemovable,
} from "@/lib/domain/rules";
import StatusBadge from "@/components/StatusBadge";
import { editDetails } from "@/lib/redux/requestsSlice";

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
const [editCustomerName, setEditCustomerName] = useState(request.customerName);
const [editCustomerEmail, setEditCustomerEmail] = useState(request.customerEmail);
const [editItemName, setEditItemName] = useState(request.itemName);
const [editQuantity, setEditQuantity] = useState(String(request.quantity));

function handleSaveEdit() {
  setError("");

  if (locked) {
    setError("This request is locked and can no longer be edited.");
    return;
  }
  if (!editCustomerName.trim() || !editCustomerEmail.trim() || !editItemName.trim()) {
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
      id: request.id,
      customerName: editCustomerName.trim(),
      customerEmail: editCustomerEmail.trim(),
      itemName: editItemName.trim(),
      quantity: qty,
    })
  );
  setIsEditing(false);
}

  if (!request) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <div className="border rounded p-8 text-center text-gray-500 text-sm">
          Request not found. It may have been removed.
        </div>
      </main>
    );
  }

  const nextStatuses = legalNextStatuses(request.status);
  const locked = isLocked(request.status);
  const removable = isRemovable(request.status);

  function handleTransition(next: ReturnStatus) {
    setError("");

    // Approved requires a valid resolution set first
    if (next === "Approved") {
      const result = validateResolution({
        resolution: resolution || null,
        refundAmount: resolution === "Refund" ? Number(refundAmount) : null,
      });
      if (!result.valid) {
        setError(result.message);
        return;
      }
      dispatch(
        setResolution({
          id: request.id,
          resolution: resolution as Resolution,
          refundAmount: resolution === "Refund" ? Number(refundAmount) : null,
        })
      );
    }

    dispatch(transitionStatus({ id: request.id, status: next }));
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    dispatch(addNote({ id: request.id, text: noteText.trim() }));
    setNoteText("");
  }

  function handleRemove() {
    if (!confirm("Remove this request from the desk? It stays in storage but won't be listed.")) {
      return;
    }
    dispatch(removeRequest({ id: request.id }));
    router.push("/");
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <button onClick={() => router.push("/")} className="text-sm text-blue-600 mb-4">
        ← Back to list
      </button>

      <div className="border rounded p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-bold font-mono">{request.reference}</h1>
          <StatusBadge status={request.status} />
        </div>
        <div className="border rounded p-4 mb-4">
  <div className="flex justify-between items-start mb-2">
    <h1 className="text-xl font-bold font-mono">{request.reference}</h1>
    <StatusBadge status={request.status} />
  </div>

  {!isEditing ? (
    <>
<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-sm mt-4">
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

      {locked ? (
        <p className="text-xs text-gray-500 mt-3">
          Details are locked — this request has already been decided.
        </p>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 mt-3"
        >
          Edit details
        </button>
      )}
    </>
  ) : (
    <div className="space-y-3 mt-4">
      <div>
        <label className="block text-sm mb-1">Customer name</label>
        <input
          type="text"
          value={editCustomerName}
          onChange={(e) => setEditCustomerName(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Customer email</label>
        <input
          type="email"
          value={editCustomerEmail}
          onChange={(e) => setEditCustomerEmail(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Item name</label>
        <input
          type="text"
          value={editItemName}
          onChange={(e) => setEditItemName(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Quantity</label>
        <input
          type="number"
          min={1}
          value={editQuantity}
          onChange={(e) => setEditQuantity(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSaveEdit}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="border px-4 py-2 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
</div>
      </div>

      {/* Actions */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {nextStatuses.length > 0 && (
        <div className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2 text-sm">Move request</h2>

          {nextStatuses.includes("Approved") && (
            <div className="flex flex-wrap gap-2 mb-3">
              <select
                value={resolution}
                onChange={(e) => setResolutionInput(e.target.value as Resolution | "")}
                className="border rounded px-2 py-1 text-sm"
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
                  className="border rounded px-2 py-1 text-sm w-32"
                />
              )}
            </div>
          )}

          <div className="flex gap-2">
            {nextStatuses.map((next) => (
              <div className="flex flex-wrap gap-2">
              <button
                key={next}
                onClick={() => handleTransition(next)}
                className="border rounded px-3 py-1 text-sm hover:bg-gray-50"
                
              >
                {next === "Rejected" ? "Reject" : `Move to ${next}`}
              </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {removable && (
        <button
          onClick={handleRemove}
          className="text-sm text-red-600 mb-4"
        >
          Remove from desk
        </button>
      )}

      {/* Notes */}
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2 text-sm">Notes</h2>
        <div className="space-y-2 mb-3">
          {request.notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet.</p>
          ) : (
            request.notes.map((n) => (
              <div key={n.id} className="text-sm border-l-2 pl-3">
                <p>{n.text}</p>
                <p className="text-xs text-gray-400">
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
            className="border rounded px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={handleAddNote}
            className="bg-black text-white px-4 py-2 rounded text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </main>
  );
}