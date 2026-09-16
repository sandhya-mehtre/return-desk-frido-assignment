import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export type ReturnReason =
  | "Damaged"
  | "Wrong Item"
  | "Size Issue"
  | "Not As Described"
  | "Changed Mind";

export type ReturnStatus =
  | "Open"
  | "In Review"
  | "Approved"
  | "Completed"
  | "Rejected";

export type Resolution = "Refund" | "Replacement" | "Store Credit";

export interface Note {
  id: string;
  text: string;
  createdAt: string; // ISO string
}

export interface ReturnRequest {
  id: string;
  reference: string; // generated, human-readable
  customerName: string;
  customerEmail: string;
  orderRef: string;
  itemSku: string;
  itemName: string;
  quantity: number;
  reason: ReturnReason;
  status: ReturnStatus;
  resolution: Resolution | null;
  refundAmount: number | null;
  notes: Note[];
  removed: boolean; // soft-delete flag, replaces DB deleted_at
  createdAt: string;
  updatedAt: string;
}

interface RequestsState {
  items: ReturnRequest[];
}

const initialState: RequestsState = {
  items: [],
};

function generateReference(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(4, "0");
  return `RD-${year}-${seq}`;
}

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    hydrateSeedData(state, action: PayloadAction<ReturnRequest[]>) {
      // only seed if store is empty, to avoid overwriting persisted data
      if (state.items.length === 0) {
        state.items = action.payload;
      }
    },
    addRequest: {
      reducer(state, action: PayloadAction<ReturnRequest>) {
        state.items.push(action.payload);
      },
      prepare(input: {
        customerName: string;
        customerEmail: string;
        orderRef: string;
        itemSku: string;
        itemName: string;
        quantity: number;
        reason: ReturnReason;
      }) {
        const now = new Date().toISOString();
        return {
          payload: {
            id: uuidv4(),
            reference: "", // filled in reducer via meta below is overkill; set in component instead
            ...input,
            status: "Open" as ReturnStatus,
            resolution: null,
            refundAmount: null,
            notes: [],
            removed: false,
            createdAt: now,
            updatedAt: now,
          },
        };
      },
    },
    transitionStatus(
      state,
      action: PayloadAction<{ id: string; status: ReturnStatus }>
    ) {
      const req = state.items.find((r) => r.id === action.payload.id);
      if (req) {
        req.status = action.payload.status;
        req.updatedAt = new Date().toISOString();
      }
    },
    setResolution(
      state,
      action: PayloadAction<{
        id: string;
        resolution: Resolution;
        refundAmount: number | null;
      }>
    ) {
      const req = state.items.find((r) => r.id === action.payload.id);
      if (req) {
        req.resolution = action.payload.resolution;
        req.refundAmount = action.payload.refundAmount;
        req.updatedAt = new Date().toISOString();
      }
    },
    editDetails(
      state,
      action: PayloadAction<{
        id: string;
        customerName?: string;
        customerEmail?: string;
        itemName?: string;
        quantity?: number;
      }>
    ) {
      const req = state.items.find((r) => r.id === action.payload.id);
      if (req) {
        Object.assign(req, action.payload);
        req.updatedAt = new Date().toISOString();
      }
    },
    addNote(state, action: PayloadAction<{ id: string; text: string }>) {
      const req = state.items.find((r) => r.id === action.payload.id);
      if (req) {
        req.notes.push({
          id: uuidv4(),
          text: action.payload.text,
          createdAt: new Date().toISOString(),
        });
        req.updatedAt = new Date().toISOString();
      }
    },
    removeRequest(state, action: PayloadAction<{ id: string }>) {
      const req = state.items.find((r) => r.id === action.payload.id);
      if (req) {
        req.removed = true;
        req.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  hydrateSeedData,
  addRequest,
  transitionStatus,
  setResolution,
  editDetails,
  addNote,
  removeRequest,
} = requestsSlice.actions;

export { generateReference };
export default requestsSlice.reducer;