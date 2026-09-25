import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Bookmark, Users, ArrowRight } from "lucide-react";
import * as userService from "@/services/user.service";
import * as searchService from "@/services/search.service";
import type { MeResponse } from "@/services/user.service";
import type { MatchCard } from "@/types/profile";

export default function Dashboard() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userService.getMe(), searchService.getMatches("recommended").catch(() => [])])
      .then(([meRes, matchRes]) => {
        setMe(meRes);
        setMatches(matchRes.slice(0, 6));
      })
      .catch(() => {
        setMe(null);
        setMatches([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const completion = me?.profile?.completionPercent ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back{me?.profile ? `, ${me.profile.fullName.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-ink-500">Here's what's happening with your matches today.</p>
      </div>

      {completion < 100 && (
        <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-800">Your profile is {completion}% complete</p>
            <div className="mt-2 h-2 w-full max-w-sm overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <Link to="/onboarding" className="btn-primary shrink-0">Complete Profile</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Search} label="Search Matches" to="/search" />
        <QuickAction icon={Users} label="View Matches" to="/matches" />
        <QuickAction icon={Heart} label="My Interests" to="/interests" />
        <QuickAction icon={Bookmark} label="Shortlist" to="/shortlist" />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recommended for you</h2>
          <Link to="/matches" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {matches.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">
            No matches yet. Complete your profile and partner preferences to see recommendations.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCardView key={match.profileId} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: typeof Search; label: string; to: string }) {
  return (
    <Link to={to} className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-elevated">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-ink-800">{label}</span>
    </Link>
  );
}

export function MatchCardView({ match }: { match: MatchCard }) {
  return (
    <Link to={`/profiles/${match.profileId}`} className="card overflow-hidden transition-shadow hover:shadow-elevated">
      <div className="relative h-44 w-full bg-ink-100">
        {match.photoUrl ? (
          <img src={match.photoUrl} alt={match.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">
            <Users className="h-10 w-10" />
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-600 shadow">
          {match.compatibilityPercent}% Match
        </span>
      </div>
      <div className="p-4">
        <p className="font-semibold text-ink-900">{match.fullName}, {match.age}</p>
        <p className="text-sm text-ink-500">{match.occupation ?? "—"}{match.city ? ` · ${match.city}` : ""}</p>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 rounded bg-ink-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl2 bg-ink-100" />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-xl2 bg-ink-100" />)}
      </div>
    </div>
  );
}
