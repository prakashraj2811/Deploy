import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import * as searchService from "@/services/search.service";
import type { MatchCard } from "@/types/profile";
import { MatchCardView } from "./Dashboard";

const CATEGORIES = [
  { key: "recommended", label: "Recommended" },
  { key: "new", label: "New Matches" },
  { key: "nearby", label: "Nearby" },
  { key: "active", label: "Recently Active" },
  { key: "premium", label: "Premium" },
];

export default function Matches() {
  const [category, setCategory] = useState("recommended");
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchService
      .getMatches(category)
      .then(setMatches)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Matches</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === c.key ? "bg-brand-500 text-white" : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : matches.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No matches found in this category yet. Try adjusting your partner preferences.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCardView key={match.profileId} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
