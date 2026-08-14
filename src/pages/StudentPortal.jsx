import { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatXLM, shortAddress, server } from "../utils/stellar";
import { CheckCircle2, Clock, ExternalLink, Loader2, ArrowDownLeft, Plus, AlertCircle } from "lucide-react";

const FIELDS = ["Computer Science", "Engineering", "Medicine", "Design", "Physics", "Law", "Arts", "Commerce", "Other"];
const DURATIONS = [7, 14, 30];

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m left`;
}

function PostRequestDialog({ open, onClose, onPosted }) {
  const { publicKey } = useWallet();
  const [form, setForm] = useState({
    purpose: "",
    field: "",
    location: "",
    description: "",
    goalXLM: "",
    durationDays: 14,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    onPosted({
      ...form,
      goalXLM: parseFloat(form.goalXLM),
      studentWallet: publicKey,
    });
    setLoading(false);
    setDone(true);
  };

  const handleClose = () => {
    setDone(false);
    setForm({ purpose: "", field: "", location: "", description: "", goalXLM: "", durationDays: 14 });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post a Funding Request</DialogTitle>
          <DialogDescription>
            Describe what you need funding for. Donors will read this and decide to support you.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-2 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <CheckCircle2 className="w-4 h-4" /> Request posted successfully
            </div>
            <p className="text-sm text-[#666]">
              Your request is now live. Donors can browse it and send XLM directly to your wallet.
            </p>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Purpose of funding</Label>
              <Input
                placeholder="e.g. Laptop for B.Tech final year project"
                value={form.purpose}
                onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                required
              />
              <p className="text-xs text-[#444]">This becomes the title of your request. Be specific.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Field of Study</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-[#444]"
                  value={form.field}
                  onChange={e => setForm(p => ({ ...p, field: e.target.value }))}
                  required
                >
                  <option value="">Select field</option>
                  {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  placeholder="City, State"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tell donors your story</Label>
              <Input
                placeholder="Why do you need this funding? What will it help you achieve?"
                maxLength={300}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                required
              />
              <p className="text-xs text-[#444]">{form.description.length}/300 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Goal Amount (XLM)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={form.goalXLM}
                  onChange={e => setForm(p => ({ ...p, goalXLM: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Request duration</Label>
                <div className="flex gap-1.5">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, durationDays: d }))}
                      className={`flex-1 h-9 text-xs font-mono rounded border transition-all ${
                        form.durationDays === d
                          ? "border-[#f2d94e]/40 bg-[#f2d94e]/10 text-[#f2d94e]"
                          : "border-[#2a2a2a] text-[#555] hover:border-[#444]"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#1e1e1e]">
              <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Receiving Wallet</div>
              <div className="font-mono text-xs text-[#666]">{publicKey}</div>
              <p className="text-xs text-[#333] mt-1">Donors will send XLM directly to this address.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting</> : "Post Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function useReceivedPayments(publicKey) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const fetch = async () => {
      if (!publicKey) return;
      try {
        const result = await server.payments().forAccount(publicKey).limit(20).order("desc").call();
        if (!mountedRef.current) return;
        const filtered = result.records
          .filter(p => p.type === "payment" && p.asset_type === "native" && p.to === publicKey)
          .map(p => ({
            id: p.id,
            from: p.from,
            amount: parseFloat(p.amount).toFixed(2),
            time: p.created_at,
            hash: p.transaction_hash,
            memo: p.memo,
          }));
        setPayments(filtered);
      } catch {}
      finally { if (mountedRef.current) setLoading(false); }
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, [publicKey]);

  return { payments, loading };
}

function RequestCard({ request, isOwn }) {
  const pct = Math.min(100, Math.round((request.raised / request.goalXLM) * 100));
  const expired = new Date(request.expiresAt) < new Date();
  const remaining = timeLeft(request.expiresAt);

  return (
    <div className={`bg-[#0d0d0d] border rounded-xl p-5 ${expired ? "border-[#1a1a1a] opacity-50" : "border-[#1e1e1e]"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{request.field}</Badge>
          {expired
            ? <Badge variant="red">Expired</Badge>
            : <Badge variant="amber"><Clock className="w-3 h-3" />{remaining}</Badge>
          }
          {request.raised >= request.goalXLM && !expired && (
            <Badge variant="green"><CheckCircle2 className="w-3 h-3" />Funded</Badge>
          )}
        </div>
        {isOwn && <Badge variant="yellow">Your request</Badge>}
      </div>

      <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{request.purpose}</h3>
      <p className="text-xs text-[#555] leading-relaxed mb-4">{request.description}</p>

      <div className="flex items-center gap-3 text-xs font-mono text-[#444] mb-4">
        <span>{request.location}</span>
        <span>·</span>
        <span>{shortAddress(request.studentWallet)}</span>
      </div>

      <div className="space-y-1.5">
        <Progress value={pct} />
        <div className="flex justify-between text-xs font-mono text-[#444]">
          <span>{request.raised} XLM raised</span>
          <span>{pct}% of {request.goalXLM} XLM</span>
        </div>
      </div>

      {request.donorCount > 0 && (
        <p className="text-xs text-[#333] font-mono mt-2">{request.donorCount} donor{request.donorCount !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}

export default function StudentPortal() {
  const { publicKey, balance } = useWallet();
  const { getRequestsByWallet, postRequest, activeRequests, expiredRequests } = useApp();
  const [tab, setTab] = useState("my-requests");
  const [showPost, setShowPost] = useState(false);
  const { payments, loading: paymentsLoading } = useReceivedPayments(publicKey);

  const myRequests = getRequestsByWallet(publicKey);
  const totalReceived = payments.reduce((s, p) => s + parseFloat(p.amount), 0);

  const tabs = [
    { id: "my-requests", label: `My Requests (${myRequests.length})` },
    { id: "received", label: `Received${payments.length > 0 ? ` (${payments.length})` : ""}` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">SCHOLARCHAIN / STUDENT</div>
            <h1 className="text-lg font-semibold text-white tracking-tight">Student Dashboard</h1>
          </div>
          <Button size="sm" onClick={() => setShowPost(true)} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Post Request
          </Button>
        </div>

        {/* Wallet strip */}
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-5 py-4 mb-6 flex flex-wrap gap-6">
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Wallet</div>
            <div className="font-mono text-xs text-[#666]">{shortAddress(publicKey)}</div>
          </div>
          <div className="w-px bg-[#1e1e1e] hidden sm:block" />
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Balance</div>
            <div className="font-mono text-sm text-white">{formatXLM(balance)} XLM</div>
          </div>
          {totalReceived > 0 && (
            <>
              <div className="w-px bg-[#1e1e1e] hidden sm:block" />
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Total Received</div>
                <div className="font-mono text-sm text-green-400">{totalReceived.toFixed(2)} XLM</div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a1a] mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[#f2d94e] text-white"
                  : "border-transparent text-[#444] hover:text-[#888]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* My Requests */}
        {tab === "my-requests" && (
          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#1e1e1e] rounded-xl">
                <div className="text-[#444] text-sm font-mono mb-3">No requests posted yet</div>
                <Button size="sm" onClick={() => setShowPost(true)} className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Post your first request
                </Button>
              </div>
            ) : (
              <>
                {/* Active requests */}
                {myRequests.filter(r => new Date(r.expiresAt) >= new Date()).map(r => (
                  <RequestCard key={r.id} request={r} isOwn={true} />
                ))}
                {/* Expired requests */}
                {myRequests.filter(r => new Date(r.expiresAt) < new Date()).length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs font-mono text-[#333] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> Expired requests
                    </div>
                    {myRequests.filter(r => new Date(r.expiresAt) < new Date()).map(r => (
                      <RequestCard key={r.id} request={r} isOwn={true} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Received Payments */}
        {tab === "received" && (
          <div className="space-y-3">
            {paymentsLoading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-[#444] font-mono py-16">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching on-chain payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 text-[#444] text-sm font-mono">
                No incoming payments found for this wallet yet.
              </div>
            ) : (
              <>
                <div className="bg-[#f2d94e]/5 border border-[#f2d94e]/20 rounded-xl px-5 py-4 flex items-center justify-between mb-2">
                  <div className="text-sm text-[#888]">Total received on-chain</div>
                  <div className="font-mono text-lg font-semibold text-[#f2d94e]">{totalReceived.toFixed(2)} XLM</div>
                </div>
                {payments.map(p => (
                  <div key={p.id} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                          <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">+{p.amount} XLM</div>
                          <div className="text-xs font-mono text-[#444] mt-0.5">{timeAgo(p.time)}</div>
                        </div>
                      </div>
                      <Badge variant="green"><CheckCircle2 className="w-3 h-3" />Confirmed</Badge>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#1a1a1a] space-y-3">
                      <div>
                        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Transaction Hash</div>
                        <div className="font-mono text-xs text-[#666] break-all">{p.hash}</div>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">From</div>
                        <div className="font-mono text-xs text-[#666]">{p.from}</div>
                      </div>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${p.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#444] hover:text-white transition-colors mt-3"
                    >
                      View on Stellar Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <PostRequestDialog
        open={showPost}
        onClose={() => setShowPost(false)}
        onPosted={(req) => { postRequest(req); setShowPost(false); setTab("my-requests"); }}
      />
    </div>
  );
}
