import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sendXLMTransaction, submitSignedTransaction, getExplorerUrl, formatXLM } from "../utils/stellar";
import { signWithFreighter } from "../utils/freighter";
import { Plus, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, ChevronDown, ChevronUp } from "lucide-react";

function Stat({ label, value }) {
  return (
    <div className="border border-[#1e1e1e] rounded-xl p-4 bg-[#0d0d0d]">
      <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-2">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function CreatePoolDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", field: "", location: "", description: "", goal: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    onCreated({ ...form, goal: parseFloat(form.goal), daysLeft: 30 });
    setForm({ title: "", field: "", location: "", description: "", goal: "" });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Scholarship Pool</DialogTitle>
          <DialogDescription>Create a fund that students can apply to.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input placeholder="e.g. Merit Award in Computer Science" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Field</Label>
              <Input placeholder="Engineering" value={form.field} onChange={e => setForm(p => ({ ...p, field: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="Mumbai, MH" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input placeholder="Who is this scholarship for?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Funding Goal (XLM)</Label>
            <Input type="number" min="1" placeholder="500" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} required />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating</> : "Create Pool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Provider donates to treasury wallet
function DonatePanel({ pool, onClose }) {
  const { publicKey, refreshBalance } = useWallet();
  const { recordDonation, TREASURY_WALLET } = useApp();
  const [amount, setAmount] = useState("");
  const [state, setState] = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState("");

  const handleDonate = async () => {
    setState("building"); setError("");
    try {
      const { xdr } = await sendXLMTransaction(publicKey, TREASURY_WALLET, amount, `ScholarChain Fund: ${pool.id}`);
      setState("signing");
      const signed = await signWithFreighter(xdr, publicKey);
      setState("submitting");
      const result = await submitSignedTransaction(signed);
      setTxHash(result.hash);
      recordDonation(pool.id, parseFloat(amount), result.hash, publicKey);
      await refreshBalance();
      setState("success");
    } catch (err) {
      const msgs = {
        INSUFFICIENT_BALANCE: "Not enough XLM.",
        USER_DECLINED_SIGN: "Cancelled in Freighter.",
        SIGN_FAILED: "Signing failed. Ensure Freighter is on Testnet.",
        TX_SUBMIT_FAILED: "Transaction failed. Try again.",
      };
      setError(msgs[err.message] || "Something went wrong.");
      setState("error");
    }
  };

  const isProcessing = ["building","signing","submitting"].includes(state);
  const stepLabel = { building: "Building...", signing: "Waiting for Freighter...", submitting: "Broadcasting..." }[state];

  if (state === "success") return (
    <div className="mt-4 pt-4 border-t border-[#1e1e1e] space-y-3">
      <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
        <CheckCircle2 className="w-4 h-4" /> {amount} XLM sent to treasury
      </div>
      <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#1e1e1e]">
        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Transaction Hash</div>
        <div className="font-mono text-xs text-[#888] break-all">{txHash}</div>
      </div>
      <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#1e1e1e]">
        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Treasury Wallet</div>
        <div className="font-mono text-xs text-[#888]">{TREASURY_WALLET}</div>
      </div>
      <a href={getExplorerUrl(txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#555] hover:text-white transition-colors">
        View on Stellar Explorer <ExternalLink className="w-3 h-3" />
      </a>
      <Button variant="outline" size="sm" className="w-full" onClick={onClose}>Done</Button>
    </div>
  );

  return (
    <div className="mt-4 pt-4 border-t border-[#1e1e1e] space-y-3">
      <div className="text-xs font-mono text-[#444] uppercase tracking-widest">Donate to Treasury</div>
      <div className="bg-[#0d0d0d] rounded-lg px-3 py-2.5 border border-[#1e1e1e]">
        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Destination</div>
        <div className="font-mono text-xs text-[#666] break-all">{TREASURY_WALLET}</div>
      </div>
      <div className="flex gap-1.5">
        {[25, 50, 100, 200].map(q => (
          <button key={q} onClick={() => setAmount(String(q))}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${amount === String(q) ? "border-[#f2d94e]/40 bg-[#f2d94e]/10 text-[#f2d94e]" : "border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]"}`}>
            {q}
          </button>
        ))}
      </div>
      <Input type="number" min="1" placeholder="Custom amount in XLM" value={amount} onChange={e => setAmount(e.target.value)} disabled={isProcessing} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {isProcessing && <div className="flex items-center gap-2 text-xs text-[#555] font-mono"><Loader2 className="w-3 h-3 animate-spin" />{stepLabel}</div>}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
        <Button size="sm" className="flex-1" onClick={handleDonate} disabled={isProcessing || !amount || parseFloat(amount) < 1}>
          {isProcessing ? stepLabel : `Send ${amount || "—"} XLM`}
        </Button>
      </div>
    </div>
  );
}

// Admin disburses from treasury to student wallet
function DisburseDialog({ app, pool, open, onClose }) {
  const { publicKey, refreshBalance } = useWallet();
  const { approveApplication, TREASURY_WALLET } = useApp();
  const [amount, setAmount] = useState(String(app?.requestedAmount || ""));
  const [state, setState] = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState("");

  const isTreasury = publicKey === TREASURY_WALLET;

  const handleDisburse = async () => {
    if (!isTreasury) {
      setError("Switch Freighter to the treasury account before disbursing.");
      return;
    }
    setState("building"); setError("");
    try {
      // Send from treasury wallet to student wallet
      const { xdr } = await sendXLMTransaction(publicKey, app.wallet, amount, `ScholarChain: Disbursement`);
      setState("signing");
      const signed = await signWithFreighter(xdr, publicKey);
      setState("submitting");
      const result = await submitSignedTransaction(signed);
      setTxHash(result.hash);
      approveApplication(pool.id, app.id, amount, result.hash, app.wallet);
      await refreshBalance();
      setState("success");
    } catch (err) {
      const msgs = {
        INSUFFICIENT_BALANCE: "Not enough XLM in connected wallet.",
        USER_DECLINED_SIGN: "Cancelled in Freighter.",
        SIGN_FAILED: "Signing failed.",
        TX_SUBMIT_FAILED: "Transaction failed.",
      };
      setError(msgs[err.message] || "Something went wrong.");
      setState("error");
    }
  };

  const isProcessing = ["building","signing","submitting"].includes(state);
  const stepLabel = { building: "Building...", signing: "Waiting for Freighter...", submitting: "Broadcasting..." }[state];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disburse Funds</DialogTitle>
          <DialogDescription>{app?.name} / {pool?.title}</DialogDescription>
        </DialogHeader>

        {state === "success" ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
              <CheckCircle2 className="w-4 h-4" /> {amount} XLM disbursed
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#1e1e1e] space-y-3">
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Transaction Hash</div>
                <div className="font-mono text-xs text-[#888] break-all">{txHash}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Student Wallet</div>
                <div className="font-mono text-xs text-[#888]">{app?.wallet}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Amount Disbursed</div>
                <div className="font-mono text-sm text-white">{amount} XLM</div>
              </div>
            </div>
            <a href={getExplorerUrl(txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#555] hover:text-white transition-colors">
              View on Stellar Explorer <ExternalLink className="w-3 h-3" />
            </a>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#1e1e1e] space-y-2">
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Student</div>
                <div className="text-sm text-white">{app?.name}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Student Wallet</div>
                <div className="font-mono text-xs text-[#666] break-all">{app?.wallet}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Requested Amount</div>
                <div className="font-mono text-sm text-[#f2d94e]">{app?.requestedAmount} XLM</div>
              </div>
            </div>

            {!isTreasury && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5 text-xs text-yellow-400">
                <div className="font-semibold mb-1">Wrong wallet connected</div>
                <div className="text-yellow-500/70">Disbursements must be sent from the treasury wallet. Switch Freighter to account 3 (treasury) before disbursing.</div>
                <div className="font-mono mt-1.5 text-yellow-500/50 break-all">{TREASURY_WALLET}</div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Amount to disburse (XLM)</Label>
              <p className="text-xs text-[#555]">You can disburse the full requested amount or a partial amount.</p>
              <Input
                type="number"
                min="1"
                max={app?.requestedAmount}
                placeholder={`Max: ${app?.requestedAmount} XLM`}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {isProcessing && <div className="flex items-center gap-2 text-xs text-[#555] font-mono"><Loader2 className="w-3 h-3 animate-spin" />{stepLabel}</div>}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isProcessing}>Cancel</Button>
              <Button className="flex-1" onClick={handleDisburse} disabled={isProcessing || !amount || parseFloat(amount) < 1 || !isTreasury}>
                {isProcessing ? stepLabel : `Disburse ${amount || "—"} XLM`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AppRow({ app, pool, onReject }) {
  const [showDisburse, setShowDisburse] = useState(false);
  const statusMap = {
    pending: { label: "Pending", variant: "amber", icon: Clock },
    approved: { label: "Approved", variant: "green", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "red", icon: XCircle },
  };
  const { label, variant, icon: Icon } = statusMap[app.status] || statusMap.pending;

  return (
    <>
      <div className="flex items-start justify-between py-3 gap-4 border-t border-[#1a1a1a] first:border-0">
        <div className="min-w-0">
          <div className="text-sm text-white font-medium">{app.name}</div>
          <div className="text-xs text-[#555] mt-0.5 font-mono">{app.institution}</div>
          <div className="text-xs text-[#444] mt-1 leading-relaxed">{app.reason?.slice(0, 80)}...</div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-mono text-[#f2d94e]">Requested: {app.requestedAmount} XLM</span>
            {app.disbursedAmount && (
              <span className="text-xs font-mono text-green-400">Disbursed: {app.disbursedAmount} XLM</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={variant}><Icon className="w-3 h-3" />{label}</Badge>
          {app.status === "pending" && (
            <div className="flex gap-1">
              <Button size="xs" variant="outline" onClick={() => onReject(app.id)}>Reject</Button>
              <Button size="xs" variant="yellow" onClick={() => setShowDisburse(true)}>Disburse</Button>
            </div>
          )}
        </div>
      </div>
      {showDisburse && (
        <DisburseDialog app={app} pool={pool} open={showDisburse} onClose={() => setShowDisburse(false)} />
      )}
    </>
  );
}

export default function ProviderPortal() {
  const { balance } = useWallet();
  const { pools, addPool, rejectApplication, TREASURY_WALLET } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [activeDonate, setActiveDonate] = useState(null);
  const [expandedApps, setExpandedApps] = useState(new Set());

  const totalRaised = pools.reduce((s, p) => s + p.raised, 0);
  const totalApps = pools.reduce((s, p) => s + p.applications.length, 0);
  const pendingApps = pools.reduce((s, p) => s + p.applications.filter(a => a.status === "pending").length, 0);

  const toggleApps = (id) => {
    setExpandedApps(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* bg gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">SCHOLARCHAIN / PROVIDER</div>
            <h1 className="text-lg font-semibold text-white tracking-tight">Dashboard</h1>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> New Pool
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Total Donated" value={`${totalRaised} XLM`} />
          <Stat label="Applications" value={totalApps} />
          <Stat label="Pending" value={pendingApps} />
        </div>

        {/* Wallet + treasury */}
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-5 py-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Connected Wallet</div>
            <div className="font-mono text-xs text-[#666]">{formatXLM(balance)} XLM available</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Treasury Wallet</div>
            <div className="font-mono text-xs text-[#666] break-all">{TREASURY_WALLET.slice(0, 20)}...</div>
          </div>
        </div>

        {/* Pool list */}
        <div className="space-y-3">
          {pools.map(pool => {
            const pct = Math.min(100, Math.round((pool.raised / pool.goal) * 100));
            const isDonating = activeDonate === pool.id;
            const appsExpanded = expandedApps.has(pool.id);
            const pendingCount = pool.applications.filter(a => a.status === "pending").length;

            return (
              <div key={pool.id} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-sm font-semibold text-white">{pool.title}</span>
                        <Badge variant="secondary">{pool.field}</Badge>
                        {pendingCount > 0 && <Badge variant="amber">{pendingCount} pending</Badge>}
                      </div>
                      <p className="text-xs text-[#555] leading-relaxed">{pool.description}</p>
                    </div>
                    <Button
                      variant={isDonating ? "surface" : "yellow"}
                      size="sm"
                      onClick={() => setActiveDonate(isDonating ? null : pool.id)}
                    >
                      {isDonating ? "Cancel" : "Donate"}
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Progress value={pct} />
                    <div className="flex justify-between text-xs font-mono text-[#444]">
                      <span>{pool.raised} XLM raised</span>
                      <span>{pct}% of {pool.goal} XLM</span>
                    </div>
                  </div>

                  {isDonating && <DonatePanel pool={pool} onClose={() => setActiveDonate(null)} />}
                </div>

                {pool.applications.length > 0 && (
                  <div className="border-t border-[#1a1a1a]">
                    <button
                      onClick={() => toggleApps(pool.id)}
                      className="w-full px-5 py-3 flex items-center justify-between text-xs font-mono text-[#444] hover:text-[#888] hover:bg-[#111] transition-colors"
                    >
                      <span>{pool.applications.length} application{pool.applications.length !== 1 ? "s" : ""}</span>
                      {appsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {appsExpanded && (
                      <div className="px-5 pb-4">
                        {pool.applications.map(app => (
                          <AppRow key={app.id} app={app} pool={pool} onReject={(id) => rejectApplication(pool.id, id)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CreatePoolDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={addPool} />
    </div>
  );
}
