import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search as SearchIcon, ShieldCheck, Users, AlertTriangle } from "lucide-react";
import * as searchService from "@/services/search.service";
import type { SearchFilters } from "@/services/search.service";
import type { SearchResultCard } from "@/types/profile";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/services/apiClient";

function calculateAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function SearchPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [filters, setFilters] = useState<SearchFilters>({ page: 1, limit: 12, sortBy: "relevance" });
  const [results, setResults] = useState<SearchResultCard[]>([]);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(nextFilters: SearchFilters) {
    setLoading(true);
    setError(null);
    try {
      const res = await searchService.searchProfiles(nextFilters);
      setResults(res.data);
      setPagination(res.pagination ? { page: res.pagination.page, totalPages: res.pagination.totalPages } : null);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load profiles right now."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: SearchFilters = {
      ...filters,
      page: 1,
      gender: (fd.get("gender") as string) || undefined,
      minAge: Number(fd.get("minAge")) || undefined,
      maxAge: Number(fd.get("maxAge")) || undefined,
      city: (fd.get("city") as string) || undefined,
      maritalStatus: (fd.get("maritalStatus") as string) || undefined,
      sortBy: (fd.get("sortBy") as string) || "relevance",
    };
    setFilters(next);
    runSearch(next);
  }

  function goToPage(page: number) {
    const next = { ...filters, page };
    setFilters(next);
    runSearch(next);
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Search Profiles</h1>

      <form onSubmit={handleFilterSubmit} className="card mt-6 grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
        <select name="gender" className="input" defaultValue="">
          <option value="">Looking for</option>
          <option value="MALE">Groom</option>
          <option value="FEMALE">Bride</option>
        </select>
        <input name="minAge" type="number" placeholder="Min Age" className="input" />
        <input name="maxAge" type="number" placeholder="Max Age" className="input" />
        <input name="city" placeholder="City" className="input" />
        <select name="maritalStatus" className="input" defaultValue="">
          <option value="">Marital Status</option>
          <option value="NEVER_MARRIED">Never Married</option>
          <option value="DIVORCED">Divorced</option>
          <option value="WIDOWED">Widowed</option>
        </select>
        <button type="submit" className="btn-primary justify-center">
          <SearchIcon className="h-4 w-4" /> Search
        </button>
      </form>

      {!accessToken && (
        <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <Link to="/register" className="font-semibold underline">Create a free account</Link> to send interests, message, and see full profiles.
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : error ? (
        <div className="card mt-8 p-10 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
          <p className="mt-3 text-sm text-ink-500">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No profiles found. Try changing your filters.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((profile) => (
              <Link
                key={profile.id}
                to={accessToken ? `/profiles/${profile.id}` : "/login"}
                className="card overflow-hidden transition-shadow hover:shadow-elevated"
              >
                <div className="relative h-48 w-full bg-ink-100">
                  {profile.photos[0] ? (
                    <img src={profile.photos[0].url} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-300"><Users className="h-10 w-10" /></div>
                  )}
                  {profile.status === "VERIFIED" && (
                    <span className="badge-verified absolute left-2 top-2"><ShieldCheck className="h-3 w-3" /> Verified</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-ink-900">{profile.fullName}, {calculateAge(profile.dateOfBirth)}</p>
                  <p className="text-sm text-ink-500">{profile.occupation ?? "—"}{profile.location ? ` · ${profile.location.city}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-9 w-9 rounded-full text-sm font-medium ${p === pagination.page ? "bg-brand-500 text-white" : "bg-white text-ink-600 border border-ink-200"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
