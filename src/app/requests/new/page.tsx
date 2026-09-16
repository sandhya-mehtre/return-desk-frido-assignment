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

  const qtyNum = Number(quantity);
  const isValid =
    customerName.trim() !== "" &&
    customerEmail.trim() !== "" &&
    orderRef.trim() !== "" &&
    itemSku.trim() !== "" &&
    itemName.trim() !== "" &&
    qtyNum >= 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError("All fields are required.");
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
      quantity: qtyNum,
      reason,
    });

    // reference is generated here, never typed by the user
    action.payload.reference = generateReference(allRequests.length);

    dispatch(action);
    router.push(`/requests/${action.payload.id}`);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => router.push("/")}
        className="border-1 border-black text-black px-4 py-2 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
      >
        ← Back to list
      </button>

      <h1 className="text-xl font-bold mb-1">Raise a Return Request</h1>
      <p className="text-sm text-gray-500 mb-5">
        Fill in the details below to submit a new return request.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order reference</label>
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item SKU</label>
            <input
              type="text"
              value={itemSku}
              onChange={(e) => setItemSku(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReturnReason)}
            className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="border-1 border-black text-black px-4 py-2 rounded w-full text-sm font-medium hover:bg-black hover:text-white transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Submit Request
        </button>
      </form>
    </main>
  );
}