import { ReturnStatus } from "@/lib/redux/requestsSlice";

const STATUS_STYLES: Record<ReturnStatus, string> = {
  Open: "bg-gray-100 text-gray-800",
  "In Review": "bg-yellow-100 text-yellow-800",
  Approved: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}