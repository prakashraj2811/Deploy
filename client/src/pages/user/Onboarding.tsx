import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, CheckCircle2, Upload, Trash2, Star } from "lucide-react";
import * as profileService from "@/services/profile.service";
import * as lookupService from "@/services/lookup.service";
import { extractErrorMessage } from "@/services/apiClient";
import type { Profile } from "@/types/profile";

const STEPS = ["Basic Info", "Education", "Career", "Family", "Lifestyle", "Partner Preference", "Photos", "Review"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileService
      .getMyProfile()
      .then(setProfile)
      .catch(() => setError("Could not load your profile. Please refresh the page."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  async function handleStepSave(updater: () => Promise<Profile>) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updater();
      setProfile(updated);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch (e) {
      setError(extractErrorMessage(e, "Could not save this step."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForVerification() {
    setSaving(true);
    setError(null);
    try {
      await profileService.submitForVerification();
      navigate("/dashboard");
    } catch (e) {
      setError(extractErrorMessage(e, "Could not submit your profile."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-page flex h-16 items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Heart className="h-5 w-5 text-brand-500" fill="currentColor" strokeWidth={0} />
          Complete Your Profile
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-ink-700">
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </span>
              <span className="text-ink-500">{profile?.completionPercent ?? 0}% complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="card p-6 sm:p-8">
            {step === 0 && <BasicInfoStep profile={profile} saving={saving} onSave={(data) => handleStepSave(() => profileService.updateBasicInfo(data))} />}
            {step === 1 && <EducationStep profile={profile} saving={saving} onSave={(data) => handleStepSave(() => profileService.updateEducation(data))} onBack={() => setStep(0)} />}
            {step === 2 && <CareerStep profile={profile} saving={saving} onSave={(data) => handleStepSave(() => profileService.updateCareer(data))} onBack={() => setStep(1)} />}
            {step === 3 && <FamilyStep profile={profile} saving={saving} onSave={(data) => handleStepSave(() => profileService.updateFamily(data))} onBack={() => setStep(2)} />}
            {step === 4 && <LifestyleStep profile={profile} saving={saving} onSave={(data) => handleStepSave(() => profileService.updateLifestyle(data))} onBack={() => setStep(3)} />}
            {step === 5 && <PreferenceStep saving={saving} onSave={(data) => handleStepSave(() => profileService.updatePartnerPreference(data))} onBack={() => setStep(4)} />}
            {step === 6 && (
              <PhotosStep
                profile={profile}
                onRefresh={async () => setProfile(await profileService.getMyProfile())}
                onNext={() => setStep(7)}
                onBack={() => setStep(5)}
              />
            )}
            {step === 7 && <ReviewStep profile={profile} saving={saving} onSubmit={handleSubmitForVerification} onBack={() => setStep(6)} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step components -------------------------------------------------------

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function StepActions({ onBack, saving, submitLabel = "Save & Continue" }: { onBack?: () => void; saving: boolean; submitLabel?: string }) {
  return (
    <div className="mt-6 flex justify-between">
      {onBack ? (
        <button type="button" onClick={onBack} className="btn-secondary">Back</button>
      ) : (
        <span />
      )}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

function BasicInfoStep({ profile, saving, onSave }: { profile: Profile | null; saving: boolean; onSave: (data: Record<string, unknown>) => void }) {
  const [religions, setReligions] = useState<lookupService.LookupItem[]>([]);
  const [communities, setCommunities] = useState<lookupService.LookupItem[]>([]);
  const [religionId, setReligionId] = useState("");

  useEffect(() => {
    lookupService.getReligions().then(setReligions);
  }, []);
  useEffect(() => {
    if (religionId) lookupService.getCommunities(religionId).then(setCommunities);
    else setCommunities([]);
  }, [religionId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      fullName: fd.get("fullName"),
      gender: fd.get("gender"),
      dateOfBirth: fd.get("dateOfBirth"),
      maritalStatus: fd.get("maritalStatus"),
      heightCm: Number(fd.get("heightCm")) || undefined,
      weightKg: Number(fd.get("weightKg")) || undefined,
      motherTongue: fd.get("motherTongue") || undefined,
      religionId: (fd.get("religionId") as string) || undefined,
      communityId: (fd.get("communityId") as string) || undefined,
      country: fd.get("country"),
      state: fd.get("state"),
      city: fd.get("city"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Tell us about yourself</h2>
      <FieldRow>
        <div>
          <label className="label">Full Name</label>
          <input name="fullName" required defaultValue={profile?.fullName} className="input" />
        </div>
        <div>
          <label className="label">Gender</label>
          <select name="gender" required defaultValue={profile?.gender ?? ""} className="input">
            <option value="" disabled>Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input type="date" name="dateOfBirth" required defaultValue={profile?.dateOfBirth?.slice(0, 10)} className="input" />
        </div>
        <div>
          <label className="label">Marital Status</label>
          <select name="maritalStatus" required defaultValue={profile?.maritalStatus ?? ""} className="input">
            <option value="" disabled>Select</option>
            <option value="NEVER_MARRIED">Never Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
            <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
          </select>
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input type="number" name="heightCm" defaultValue={profile?.heightCm ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Weight (kg)</label>
          <input type="number" name="weightKg" defaultValue={profile?.weightKg ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Mother Tongue</label>
          <input name="motherTongue" defaultValue={profile?.motherTongue ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Religion</label>
          <select name="religionId" defaultValue="" onChange={(e) => setReligionId(e.target.value)} className="input">
            <option value="">Select</option>
            {religions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Community</label>
          <select name="communityId" defaultValue="" className="input" disabled={!communities.length}>
            <option value="">Select</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </FieldRow>
      <h3 className="pt-2 text-sm font-semibold text-ink-700">Location</h3>
      <FieldRow>
        <div>
          <label className="label">Country</label>
          <input name="country" required defaultValue={profile?.location?.country ?? "India"} className="input" />
        </div>
        <div>
          <label className="label">State</label>
          <input name="state" required defaultValue={profile?.location?.state ?? ""} className="input" />
        </div>
        <div>
          <label className="label">City</label>
          <input name="city" required defaultValue={profile?.location?.city ?? ""} className="input" />
        </div>
      </FieldRow>
      <StepActions saving={saving} />
    </form>
  );
}

function EducationStep({ profile, saving, onSave, onBack }: { profile: Profile | null; saving: boolean; onSave: (d: Record<string, unknown>) => void; onBack: () => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      highestQualification: fd.get("highestQualification") || undefined,
      college: fd.get("college") || undefined,
      fieldOfStudy: fd.get("fieldOfStudy") || undefined,
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Education</h2>
      <FieldRow>
        <div>
          <label className="label">Highest Qualification</label>
          <input name="highestQualification" defaultValue={profile?.highestQualification ?? ""} className="input" />
        </div>
        <div>
          <label className="label">College / University</label>
          <input name="college" className="input" />
        </div>
        <div>
          <label className="label">Field of Study</label>
          <input name="fieldOfStudy" className="input" />
        </div>
      </FieldRow>
      <StepActions onBack={onBack} saving={saving} />
    </form>
  );
}

function CareerStep({ profile, saving, onSave, onBack }: { profile: Profile | null; saving: boolean; onSave: (d: Record<string, unknown>) => void; onBack: () => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      occupation: fd.get("occupation") || undefined,
      company: fd.get("company") || undefined,
      jobTitle: fd.get("jobTitle") || undefined,
      annualIncome: Number(fd.get("annualIncome")) || undefined,
      workLocation: fd.get("workLocation") || undefined,
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Profession</h2>
      <FieldRow>
        <div>
          <label className="label">Occupation</label>
          <input name="occupation" defaultValue={profile?.occupation ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Company</label>
          <input name="company" className="input" />
        </div>
        <div>
          <label className="label">Job Title</label>
          <input name="jobTitle" className="input" />
        </div>
        <div>
          <label className="label">Annual Income (₹)</label>
          <input type="number" name="annualIncome" defaultValue={profile?.annualIncome ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Work Location</label>
          <input name="workLocation" className="input" />
        </div>
      </FieldRow>
      <StepActions onBack={onBack} saving={saving} />
    </form>
  );
}

function FamilyStep({ saving, onSave, onBack }: { profile: Profile | null; saving: boolean; onSave: (d: Record<string, unknown>) => void; onBack: () => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      familyType: fd.get("familyType") || undefined,
      familyStatus: fd.get("familyStatus") || undefined,
      familyLocation: fd.get("familyLocation") || undefined,
      fatherDetails: fd.get("fatherDetails") || undefined,
      motherDetails: fd.get("motherDetails") || undefined,
      siblingsDetails: fd.get("siblingsDetails") || undefined,
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Family Details</h2>
      <FieldRow>
        <div>
          <label className="label">Family Type</label>
          <select name="familyType" defaultValue="" className="input">
            <option value="">Select</option>
            <option value="NUCLEAR">Nuclear</option>
            <option value="JOINT">Joint</option>
          </select>
        </div>
        <div>
          <label className="label">Family Status</label>
          <select name="familyStatus" defaultValue="" className="input">
            <option value="">Select</option>
            <option value="MIDDLE_CLASS">Middle Class</option>
            <option value="UPPER_MIDDLE_CLASS">Upper Middle Class</option>
            <option value="RICH">Rich</option>
            <option value="AFFLUENT">Affluent</option>
          </select>
        </div>
        <div>
          <label className="label">Family Location</label>
          <input name="familyLocation" className="input" />
        </div>
      </FieldRow>
      <div>
        <label className="label">Father's Details</label>
        <textarea name="fatherDetails" rows={2} className="input" />
      </div>
      <div>
        <label className="label">Mother's Details</label>
        <textarea name="motherDetails" rows={2} className="input" />
      </div>
      <div>
        <label className="label">Siblings</label>
        <textarea name="siblingsDetails" rows={2} className="input" />
      </div>
      <StepActions onBack={onBack} saving={saving} />
    </form>
  );
}

function LifestyleStep({ profile, saving, onSave, onBack }: { profile: Profile | null; saving: boolean; onSave: (d: Record<string, unknown>) => void; onBack: () => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const hobbies = String(fd.get("hobbies") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const interests = String(fd.get("interests") || "").split(",").map((s) => s.trim()).filter(Boolean);
    onSave({
      foodPreference: fd.get("foodPreference") || undefined,
      smoking: fd.get("smoking") || undefined,
      drinking: fd.get("drinking") || undefined,
      hobbies,
      interests,
      aboutMe: fd.get("aboutMe") || undefined,
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Lifestyle</h2>
      <FieldRow>
        <div>
          <label className="label">Food Preference</label>
          <select name="foodPreference" defaultValue="" className="input">
            <option value="">Select</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="NON_VEGETARIAN">Non-Vegetarian</option>
            <option value="EGGETARIAN">Eggetarian</option>
            <option value="VEGAN">Vegan</option>
          </select>
        </div>
        <div>
          <label className="label">Smoking</label>
          <select name="smoking" defaultValue="" className="input">
            <option value="">Select</option>
            <option value="NEVER">Never</option>
            <option value="OCCASIONALLY">Occasionally</option>
            <option value="REGULARLY">Regularly</option>
          </select>
        </div>
        <div>
          <label className="label">Drinking</label>
          <select name="drinking" defaultValue="" className="input">
            <option value="">Select</option>
            <option value="NEVER">Never</option>
            <option value="OCCASIONALLY">Occasionally</option>
            <option value="REGULARLY">Regularly</option>
          </select>
        </div>
      </FieldRow>
      <div>
        <label className="label">Hobbies (comma-separated)</label>
        <input name="hobbies" placeholder="Reading, Travel, Cooking" className="input" />
      </div>
      <div>
        <label className="label">Interests (comma-separated)</label>
        <input name="interests" placeholder="Music, Cricket, Yoga" className="input" />
      </div>
      <div>
        <label className="label">About Me</label>
        <textarea name="aboutMe" rows={4} maxLength={2000} defaultValue={profile?.aboutMe ?? ""} className="input" />
      </div>
      <StepActions onBack={onBack} saving={saving} />
    </form>
  );
}

function PreferenceStep({ saving, onSave, onBack }: { saving: boolean; onSave: (d: Record<string, unknown>) => void; onBack: () => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      minAge: Number(fd.get("minAge")) || undefined,
      maxAge: Number(fd.get("maxAge")) || undefined,
      minHeightCm: Number(fd.get("minHeightCm")) || undefined,
      maxHeightCm: Number(fd.get("maxHeightCm")) || undefined,
      minIncome: Number(fd.get("minIncome")) || undefined,
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Partner Preferences</h2>
      <FieldRow>
        <div>
          <label className="label">Min Age</label>
          <input type="number" name="minAge" className="input" />
        </div>
        <div>
          <label className="label">Max Age</label>
          <input type="number" name="maxAge" className="input" />
        </div>
        <div>
          <label className="label">Min Height (cm)</label>
          <input type="number" name="minHeightCm" className="input" />
        </div>
        <div>
          <label className="label">Max Height (cm)</label>
          <input type="number" name="maxHeightCm" className="input" />
        </div>
        <div>
          <label className="label">Minimum Income (₹)</label>
          <input type="number" name="minIncome" className="input" />
        </div>
      </FieldRow>
      <StepActions onBack={onBack} saving={saving} />
    </form>
  );
}

function PhotosStep({ profile, onRefresh, onNext, onBack }: { profile: Profile | null; onRefresh: () => Promise<void>; onNext: () => void; onBack: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await profileService.uploadPhoto(file);
      await onRefresh();
    } catch (err) {
      setError(extractErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(photoId: string) {
    await profileService.deletePhoto(photoId);
    await onRefresh();
  }

  async function handleSetPrimary(photoId: string) {
    await profileService.setPrimaryPhoto(photoId);
    await onRefresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Photos</h2>
      <p className="text-sm text-ink-500">Add clear, recent photos. JPEG/PNG/WEBP, up to 5MB each.</p>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {profile?.photos.map((photo) => (
          <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-ink-100">
            <img src={photo.url} alt="Profile" className="h-36 w-full object-cover" />
            {photo.isPrimary && <span className="badge-premium absolute left-2 top-2">Primary</span>}
            <div className="absolute inset-0 flex items-end justify-center gap-2 bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {!photo.isPrimary && (
                <button onClick={() => handleSetPrimary(photo.id)} className="rounded-full bg-white p-1.5" title="Set as primary">
                  <Star className="h-4 w-4 text-ink-800" />
                </button>
              )}
              <button onClick={() => handleDelete(photo.id)} className="rounded-full bg-white p-1.5" title="Delete">
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 text-ink-400 hover:border-brand-300 hover:text-brand-500">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-xs font-medium">Upload Photo</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">Back</button>
        <button type="button" onClick={onNext} className="btn-primary">Continue</button>
      </div>
    </div>
  );
}

function ReviewStep({ profile, saving, onSubmit, onBack }: { profile: Profile | null; saving: boolean; onSubmit: () => void; onBack: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
      <h2 className="text-lg font-semibold text-ink-900">Ready to submit</h2>
      <p className="text-sm text-ink-500">
        Your profile is {profile?.completionPercent ?? 0}% complete. Once submitted, our team will review and verify your
        profile before it becomes visible in search results.
      </p>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">Back</button>
        <button type="button" onClick={onSubmit} disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit for Verification
        </button>
      </div>
    </div>
  );
}
