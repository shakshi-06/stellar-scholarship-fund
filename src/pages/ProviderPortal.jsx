import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { sendXLMTransaction, submitSignedTransaction, getExplorerUrl, formatXLM, NETWORK_PASSPHRASE } from "../utils/stellar";
import { signWithFreighter } from "../utils/freighter";
import { Plus, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, TrendingUp, Users, Wallet } from "lucide-react";

const DEMO_WALLET = "GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL";

function CreatePoolDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", field: "", location: "", description: "", goal: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onCreated({ ...form, goal: parseFloat(form.goal), daysLeft: 30 });
    setForm({ title: "", field: "", location: "", description: "", goal: "" });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Syne'] font-bold">Create Scholarship Pool</DialogTitle>
          <DialogDescription>Set up a new scholarship fund for students to apply to.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Scholarship Title</Label>
            <Input id="title" placeholder="e.g. Merit Award in Computer Science" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="field">Field of Study</Label>
              <Input id="field" placeholder="e.g. Engineering" value={form.field} onChange={e => setForm(p => ({ ...p, field: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Mumbai, MH" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" placeholder="Who is this scholarship for?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal">Funding Goal (XLM)</Label>
            <Input id="goal" type="number" min="1" placeholder="500" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating</> : "Create Pool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DisburseDonation({ pool, onDone }) {
  const { publicKey, refreshBalance } = useWallet();
  const { recordDonation } = useApp();
  const [amount, setAmount] = useState("");
  const [state, setState] = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState("");

  const handleDisburse = async () => {
    setState("building");
    setError("");
    try {
      const { xdr } = await sendXLMTransaction(publicKey, DEMO_WALLET, amount, `ScholarChain: ${pool.title.slice(0, 20)}`);
      setState("signing");
      const signed = await signWithFreighter(xdr, publicKey);
      setState("submitting");
      const result = await submitSignedTransaction(signed);
      setTxHash(result.hash);
      recordDonation(pool.id, parseFloat(amount), result.hash);
      await refreshBalance();
      setState("success");
    } catch (err) {
      const msgs = {
        INSUFFICIENT_BALANCE: "Not enough XLM. Use Get Test XLM first.",
        USER_DECLINED_SIGN: "Transaction cancelled in Freighter.",
        SIGN_FAILED: "Signing failed. Make sure Freighter is on Testnet.",
        TX_SUBMIT_FAILED: "Transaction failed. Please try again.",
      };
      setError(msgs[err.message] || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  const stepLabel = { building: "Building transaction...", signing: "Check Freighter...", submitting: "Broadcasting..." }[state];
  const isProcessing = ["building", "signing", "submitting"].includes(state);

  if (state === "success") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="w-4 h-4" /> Funds disbursed successfully
        </div>
        <div className="bg-stone-50 rounded-md p-3 font-mono text-xs text-stone-600 break-all">{txHash}</div>
        <a href={getExplorerUrl(txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D96B3F] hover:underline">
          View on Stellar Explorer <ExternalLink className="w-3 h-3" />
        </a>
        <Button variant="outline" size="sm" className="w-full" onClick={onDone}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Amount to disburse (XLM)</Label>
        <div className="flex gap-2">
          {[10, 25, 50, 100].map(q => (
            <button key={q} onClick={() => setAmount(String(q))} className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${amount === String(q) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white hover:border-stone-300"}`}>{q}</button>
          ))}
        </div>
        <Input type="number" min="1" placeholder="Custom amount" value={amount} onChange={e => setAmount(e.target.value)} disabled={isProcessing} />
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">{error}</p>}
      {isProcessing && (
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {stepLabel}
        </div>
      )}
      <Button className="w-full" onClick={handleDisburse} disabled={isProcessing || !amount || parseFloat(amount) < 1}>
        {isProcessing ? stepLabel : `Disburse ${amount || ""} XLM`}
      </Button>
    </div>
  );
}

function ApplicationRow({ app, onApprove, onReject }) {
  const statusConfig = {
    pending: { label: "Pending", variant: "yellow", icon: Clock },
    approved: { label: "Approved", variant: "green", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  };
  const { label, variant, icon: Icon } = statusConfig[app.status] || statusConfig.pending;

  return (
    <div className="flex items-start justify-between py-3 gap-4">
      <div className="min-w-0">
        <div className="font-medium text-sm text-stone-900">{app.name}</div>
        <div className="text-xs text-stone-500 mt-0.5">{app.reason?.slice(0, 80)}{app.reason?.length > 80 ? "..." : ""}</div>
        <div className="text-xs text-stone-400 mt-1 font-mono">{app.wallet?.slice(0, 14)}...</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={variant} className="flex items-center gap-1">
          <Icon className="w-3 h-3" /> {label}
        </Badge>
        {app.status === "pending" && (
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => onReject(app.id)}>Reject</Button>
            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onApprove(app.id)}>Approve</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProviderPortal() {
  const { publicKey, balance } = useWallet();
  const { pools, addPool, updateApplication } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [disbursePool, setDisbursePool] = useState(null);

  const totalRaised = pools.reduce((s, p) => s + p.raised, 0);
  const totalApps = pools.reduce((s, p) => s + p.applications.length, 0);
  const pendingApps = pools.reduce((s, p) => s + p.applications.filter(a => a.status === "pending").length, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Syne'] text-2xl font-extrabold text-stone-900 tracking-tight">Provider Dashboard</h1>
            <p className="text-sm text-stone-500 mt-1">Manage your scholarship pools and review applications.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Pool
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Disbursed", value: `${totalRaised} XLM`, icon: TrendingUp },
            { label: "Total Applications", value: totalApps, icon: Users },
            { label: "Pending Review", value: pendingApps, icon: Clock },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-stone-600" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 uppercase tracking-wider">{stat.label}</div>
                    <div className="font-['Syne'] font-bold text-stone-900 text-lg">{stat.value}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Wallet info */}
        <Card className="mb-8">
          <CardContent className="p-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider">Connected Wallet</div>
                <div className="font-mono text-sm font-medium text-stone-900">{publicKey?.slice(0, 20)}...</div>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Available Balance</div>
              <div className="font-['Syne'] font-bold text-stone-900">{formatXLM(balance)} XLM</div>
            </div>
          </CardContent>
        </Card>

        {/* Pools */}
        <div className="space-y-4">
          {pools.map(pool => {
            const pct = Math.min(100, Math.round((pool.raised / pool.goal) * 100));
            const isDisbursing = disbursePool?.id === pool.id;
            return (
              <Card key={pool.id}>
                <CardContent className="p-0">
                  <div className="h-1 rounded-t-lg bg-[#F4956A]" style={{ width: `${pct}%`, minWidth: pct > 0 ? "8px" : "0" }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-['Syne'] font-bold text-stone-900">{pool.title}</h3>
                          <Badge variant="secondary" className="text-xs">{pool.field}</Badge>
                          <Badge variant="outline" className="text-xs">{pool.daysLeft}d left</Badge>
                        </div>
                        <p className="text-sm text-stone-500">{pool.description}</p>
                      </div>
                      <Button
                        variant={isDisbursing ? "secondary" : "peach"}
                        size="sm"
                        onClick={() => setDisbursePool(isDisbursing ? null : pool)}
                        className="flex-shrink-0"
                      >
                        {isDisbursing ? "Cancel" : "Disburse"}
                      </Button>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>{pool.raised} XLM raised</span>
                        <span className="font-semibold text-stone-900">{pct}% of {pool.goal} XLM</span>
                      </div>
                      <Progress value={pct} />
                    </div>

                    {isDisbursing && (
                      <>
                        <Separator className="mb-4" />
                        <DisburseDonation pool={pool} onDone={() => setDisbursePool(null)} />
                      </>
                    )}

                    {pool.applications.length > 0 && (
                      <>
                        <Separator className="mb-3" />
                        <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                          Applications ({pool.applications.length})
                        </div>
                        <div className="divide-y divide-stone-100">
                          {pool.applications.map(app => (
                            <ApplicationRow
                              key={app.id}
                              app={app}
                              onApprove={(id) => updateApplication(pool.id, id, "approved")}
                              onReject={(id) => updateApplication(pool.id, id, "rejected")}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {pool.applications.length === 0 && (
                      <p className="text-xs text-stone-400 mt-2">No applications yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <CreatePoolDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={addPool} />
    </div>
  );
}
