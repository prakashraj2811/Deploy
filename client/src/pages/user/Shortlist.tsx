import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Bookmark, X } from "lucide-react";
import * as interestService from "@/services/interest.service";

interface ShortlistRow {
  targetId: string;
  category: string;
  target?: { profile?: { fullName: string; photos: { url: string }[] } | null };
}

export default function Shortlist() {
  const [items, setItems] = useState<ShortlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems((await interestService.listShortlist()) as ShortlistRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(targetId: string) {
    await interestService.removeFromShortlist(targetId);
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Shortlist</h1>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">You haven't shortlisted any profiles yet.</p>
          <Link to="/search" className="btn-primary mt-4 inline-flex">Browse Profiles</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.targetId} className="card flex items-center justify-between gap-3 p-4">
              <Link to={`/profiles/${item.targetId}`} className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-ink-100">
                  {item.target?.profile?.photos?.[0] && <img src={item.target.profile.photos[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div>
                  <p className="font-semibold text-ink-900">{item.target?.profile?.fullName ?? "Member"}</p>
                  <p className="text-xs text-ink-500">{item.category}</p>
                </div>
              </Link>
              <button onClick={() => handleRemove(item.targetId)} className="text-ink-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
