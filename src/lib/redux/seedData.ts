import { v4 as uuidv4 } from "uuid";
import type {
  ReturnRequest,
  ReturnReason,
  ReturnStatus,
  Resolution,
} from "./requestsSlice";

const reasons: ReturnReason[] = [
  "Damaged",
  "Wrong Item",
  "Size Issue",
  "Not As Described",
  "Changed Mind",
];

const statuses: ReturnStatus[] = [
  "Open",
  "In Review",
  "Approved",
  "Completed",
  "Rejected",
];

const customerNames = [
  "Aarav Shah", "Priya Nair", "Rohan Mehta", "Isha Kapoor", "Vikram Rao",
  "Ananya Iyer", "Karan Malhotra", "Sneha Reddy", "Arjun Singh", "Neha Gupta",
];

const itemNames = [
  "Running Shoes", "Denim Jacket", "Wireless Earbuds", "Backpack",
  "Cotton T-Shirt", "Sunglasses", "Yoga Mat", "Water Bottle",
  "Laptop Sleeve", "Desk Lamp",
];

function resolutionForStatus(status: ReturnStatus): {
  resolution: Resolution | null;
  refundAmount: number | null;
} {
  if (status === "Approved" || status === "Completed") {
    const options: Resolution[] = ["Refund", "Replacement", "Store Credit"];
    const resolution = options[Math.floor(Math.random() * options.length)];
    return {
      resolution,
      refundAmount: resolution === "Refund" ? Math.floor(Math.random() * 4000) + 200 : null,
    };
  }
  return { resolution: null, refundAmount: null };
}

export function generateSeedRequests(): ReturnRequest[] {
  const requests: ReturnRequest[] = [];
  const count = 32;

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const reason = reasons[i % reasons.length];
    const { resolution, refundAmount } = resolutionForStatus(status);
    const now = new Date();
    const createdAt = new Date(
      now.getTime() - Math.floor(Math.random() * 20) * 86400000
    ).toISOString();

    const notes =
      i % 3 === 0
        ? [
            {
              id: uuidv4(),
              text: "Customer contacted for more details.",
              createdAt,
            },
          ]
        : [];

    requests.push({
      id: uuidv4(),
      reference: `RD-${now.getFullYear()}-${String(i + 1).padStart(4, "0")}`,
      customerName: customerNames[i % customerNames.length],
      customerEmail: `${customerNames[i % customerNames.length]
        .toLowerCase()
        .replace(" ", ".")}@example.com`,
      orderRef: `ORD-${1000 + i}`,
      itemSku: `SKU-${100 + i}`,
      itemName: itemNames[i % itemNames.length],
      quantity: (i % 3) + 1,
      reason,
      status,
      resolution,
      refundAmount,
      notes,
      removed: false,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return requests;
}