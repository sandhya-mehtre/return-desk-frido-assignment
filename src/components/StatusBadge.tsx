import { ReturnStatus } from "@/lib/redux/requestsSlice";

const STATUS_STYLES: Record<ReturnStatus, string> = {
  Open: "bg-gray-100 text-gray-800 border-gray-300",
  "In Review": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Approved: "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Rejected: "bg-red-100 text-red-800 border-red-300",
};

export default function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span
      className={`inline-block w-28 text-center px-2 py-1 rounded border text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}