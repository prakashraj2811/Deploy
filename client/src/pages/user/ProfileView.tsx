import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Heart, Bookmark, MessageCircle, Flag, ShieldCheck, Users } from "lucide-react";
import * as profileService from "@/services/profile.service";
import * as interestService from "@/services/interest.service";
import { apiClient, extractErrorMessage } from "@/services/apiClient";
import type { Profile } from "@/types/profile";

function calculateAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    profileService
      .getProfileById(id)
      .then(setProfile)
      .catch((err) => setError(extractErrorMessage(err, "Profile not found")))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSendInterest() {
    if (!id) return;
    try {
      await interestService.sendInterest(id);
      setActionMessage("Interest sent!");
    } catch (err) {
      setActionMessage(extractErrorMessage(err));
    }
  }

  async function handleShortlist() {
    if (!id) return;
    try {
      await interestService.addToShortlist(id);
      setActionMessage("Added to shortlist");
    } catch (err) {
      setActionMessage(extractErrorMessage(err));
    }
  }

  async function handleReport() {
    if (!id) return;
    const reason = prompt("Reason for reporting this profile (e.g. FAKE_PROFILE, SPAM, HARASSMENT):", "OTHER");
    if (!reason) return;
    try {
      await apiClient.post("/reports", { againstId: id, reason, details: "" });
      setActionMessage("Report submitted. Our team will review it.");
    } catch (err) {
      setActionMessage(extractErrorMessage(err));
    }
  }

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  if (error || !profile) return <div className="card p-10 text-center text-sm text-ink-500">{error ?? "Profile not found"}</div>;

  const primaryPhoto = profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="card overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-[280px_1fr]">
          <div className="h-72 bg-ink-100 sm:h-full">
            {primaryPhoto ? (
              <img src={primaryPhoto.url} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-300"><Users className="h-12 w-12" /></div>
            )}
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink-900">{profile.fullName}</h1>
              {profile.status === "VERIFIED" && <span className="badge-verified"><ShieldCheck className="h-3 w-3" /> Verified</span>}
            </div>
            <p className="mt-1 text-ink-500">
              {calculateAge(profile.dateOfBirth)} yrs
              {profile.heightCm ? ` · ${Math.floor(profile.heightCm / 30.48)}'${Math.round((profile.heightCm % 30.48) / 2.54)}"` : ""}
              {profile.location ? ` · ${profile.location.city}, ${profile.location.state}` : ""}
            </p>
            <p className="mt-1 text-sm text-ink-500">{profile.occupation ?? "—"}{profile.highestQualification ? ` · ${profile.highestQualification}` : ""}</p>

            {actionMessage && <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{actionMessage}</p>}

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={handleSendInterest} className="btn-primary"><Heart className="h-4 w-4" /> Send Interest</button>
              <button onClick={handleShortlist} className="btn-secondary"><Bookmark className="h-4 w-4" /> Shortlist</button>
              <button onClick={() => navigate(`/messages?with=${id}`)} className="btn-secondary"><MessageCircle className="h-4 w-4" /> Message</button>
              <button onClick={handleReport} className="btn-ghost text-red-600"><Flag className="h-4 w-4" /> Report</button>
            </div>
          </div>
        </div>
      </div>

      {profile.aboutMe && (
        <div className="card mt-6 p-6">
          <h2 className="mb-2 font-semibold text-ink-900">About</h2>
          <p className="text-sm text-ink-600">{profile.aboutMe}</p>
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 font-semibold text-ink-900">Basic Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Marital Status" value={profile.maritalStatus.replace("_", " ")} />
            <Row label="Mother Tongue" value={profile.motherTongue} />
            <Row label="Religion" value={profile.religion?.name} />
            <Row label="Community" value={profile.community?.name} />
          </dl>
        </div>
        <div className="card p-6">
          <h2 className="mb-3 font-semibold text-ink-900">Career</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Occupation" value={profile.occupation} />
            <Row label="Education" value={profile.highestQualification} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-ink-50 py-1.5">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-800">{value || "—"}</dd>
    </div>
  );
}
