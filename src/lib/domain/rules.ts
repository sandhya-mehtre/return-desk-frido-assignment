import { Resolution, ReturnRequest, ReturnStatus } from "../redux/requestsSlice";

// ---- 1. Status flow ----
export const TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  Open: ["In Review"],
  "In Review": ["Approved", "Rejected"],
  Approved: ["Completed"],
  Completed: [],
  Rejected: [],
};

export function isTransitionAllowed(
  from: ReturnStatus,
  to: ReturnStatus
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function legalNextStatuses(current: ReturnStatus): ReturnStatus[] {
  return TRANSITIONS[current];
}

// ---- 2. Approval needs a resolution ----
export interface ResolutionInput {
  resolution: Resolution | null;
  refundAmount: number | null;
}

export function validateResolution(
  input: ResolutionInput
): { valid: true } | { valid: false; message: string } {
  if (!input.resolution) {
    return {
      valid: false,
      message: "A resolution (Refund, Replacement or Store Credit) is required to approve.",
    };
  }
  if (input.resolution === "Refund") {
    if (input.refundAmount === null || input.refundAmount <= 0) {
      return {
        valid: false,
        message: "A refund amount greater than zero is required for Refund.",
      };
    }
  } else {
    if (input.refundAmount !== null) {
      return {
        valid: false,
        message: "Refund amount must not be set unless resolution is Refund.",
      };
    }
  }
  return { valid: true };
}

// ---- 3. One live request per item ----
const LIVE_STATUSES: ReturnStatus[] = ["Open", "In Review", "Approved"];

export function hasLiveDuplicate(
  requests: ReturnRequest[],
  orderRef: string,
  itemSku: string,
  excludeId?: string
): boolean {
  return requests.some(
    (r) =>
      r.id !== excludeId &&
      !r.removed &&
      r.orderRef === orderRef &&
      r.itemSku === itemSku &&
      LIVE_STATUSES.includes(r.status)
  );
}

// ---- 4. Locked once decided ----
const LOCKED_STATUSES: ReturnStatus[] = ["Approved", "Rejected", "Completed"];

export function isLocked(status: ReturnStatus): boolean {
  return LOCKED_STATUSES.includes(status);
}

// ---- 5. Removal ----
const REMOVABLE_STATUSES: ReturnStatus[] = ["Open", "Rejected"];

export function isRemovable(status: ReturnStatus): boolean {
  return REMOVABLE_STATUSES.includes(status);
}