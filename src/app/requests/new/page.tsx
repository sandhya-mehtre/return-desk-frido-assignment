"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addRequest, generateReference } from "@/lib/redux/requestsSlice";
import type { ReturnReason } from "@/lib/redux/requestsSlice";
import { hasLiveDuplicate } from "@/lib/domain/rules";

const REASONS: ReturnReason[] = [
  "Damaged",
  "Wrong Item",
  "Size Issue",
  "Not As Described",
  "Changed Mind",
];

export default function NewRequestPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const allRequests = useAppSelector((state) => state.requests.items);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [itemSku, setItemSku] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<ReturnReason>("Damaged");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !customerEmail.trim() || !orderRef.trim() || !itemSku.trim() || !itemName.trim()) {
      setError("All fields are required.");
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    // business rule 3: one live request per item on an order
    if (hasLiveDuplicate(allRequests, orderRef.trim(), itemSku.trim())) {
      setError(
        "A live request already exists for this order and item. Close it out before raising a new one."
      );
      return;
    }

    const action = addRequest({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      orderRef: orderRef.trim(),
      itemSku: itemSku.trim(),
      itemName: itemName.trim(),
      quantity: qty,
      reason,
    });

    // reference is generated here, never typed by the user
    action.payload.reference = generateReference(allRequests.length);

    dispatch(action);
    router.push(`/requests/${action.payload.id}`);
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <button onClick={() => router.push("/")} className="text-sm text-blue-600 mb-4">
        ← Back to list
      </button>

      <h1 className="text-xl font-bold mb-4">Raise a Return Request</h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Customer name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Customer email</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Order reference</label>
          <input
            type="text"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Item SKU</label>
          <input
            type="text"
            value={itemSku}
            onChange={(e) => setItemSku(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Item name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReturnReason)}
            className="border rounded px-3 py-2 text-sm w-full"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded text-sm w-full"
        >
          Submit Request
        </button>
      </form>
    </main>
  );
}