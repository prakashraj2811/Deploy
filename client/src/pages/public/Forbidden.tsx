import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <ShieldAlert className="h-14 w-14 text-brand-500" />
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Access denied</h1>
      <p className="mt-2 max-w-md text-ink-500">You don't have permission to view this page.</p>
      <Link to="/dashboard" className="btn-primary mt-6">Go to Dashboard</Link>
    </div>
  );
}
