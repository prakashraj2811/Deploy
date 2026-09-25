import { useEffect, useState } from "react";
import { Loader2, Heart, Check, X, Undo2 } from "lucide-react";
import * as interestService from "@/services/interest.service";

interface InterestRow {
  id: string;
  status: string;
  createdAt: string;
  sender?: { profile?: { fullName: string; photos: { url: string }[] } | null };
  receiver?: { profile?: { fullName: string; photos: { url: string }[] } | null };
}

export default function Interests() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [items, setItems] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = tab === "received" ? await interestService.listReceivedInterests() : await interestService.listSentInterests();
      setItems(data as InterestRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleAction(id: string, action: "accept" | "decline" | "withdraw") {
    if (action === "accept") await interestService.acceptInterest(id);
    if (action === "decline") await interestService.declineInterest(id);
    if (action === "withdraw") await interestService.withdrawInterest(id);
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Interests</h1>
      <div className="mt-4 flex gap-2">
        {(["received", "sent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-brand-500 text-white" : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No {tab} interests yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const person = tab === "received" ? item.sender?.profile : item.receiver?.profile;
            return (
              <div key={item.id} className="card flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-ink-100">
                    {person?.photos?.[0] && <img src={person.photos[0].url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{person?.fullName ?? "Member"}</p>
                    <p className="text-xs capitalize text-ink-500">{item.status.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {tab === "received" && item.status === "SENT" && (
                    <>
                      <button onClick={() => handleAction(item.id, "accept")} className="btn-primary !px-3 !py-1.5 text-xs">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button onClick={() => handleAction(item.id, "decline")} className="btn-secondary !px-3 !py-1.5 text-xs">
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                    </>
                  )}
                  {tab === "sent" && item.status === "SENT" && (
                    <button onClick={() => handleAction(item.id, "withdraw")} className="btn-secondary !px-3 !py-1.5 text-xs">
                      <Undo2 className="h-3.5 w-3.5" /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
