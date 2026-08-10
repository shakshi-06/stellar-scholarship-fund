import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatXLM, shortAddress } from "../utils/stellar";
import { CheckCircle2, XCircle, Clock, MapPin, BookOpen, Loader2 } from "lucide-react";

const FIELDS = ["All", "Computer Science", "Engineering", "Medicine", "Design", "Physics", "Law"];

function ApplyDialog({ pool, open, onClose, onApplied }) {
  const { publicKey } = useWallet();
  const [form, setForm] = useState({ name: "", reason: "", institution: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    onApplied(pool.id, { ...form, wallet: publicKey, id: Date.now(), status: "pending" });
    setLoading(false);
    setDone(true);
  };

  const handleClose = () => {
    setDone(false);
    setForm({ name: "", reason: "", institution: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Syne'] font-bold">Apply for Scholarship</DialogTitle>
          <DialogDescription>{pool?.title}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="w-4 h-4" /> Application submitted successfully
            </div>
            <p className="text-sm text-stone-500">The scholarship provider will review your application. Check your application status in the My Applications tab.</p>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" placeholder="College or university name" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason">Why do you deserve this scholarship?</Label>
              <Input id="reason" placeholder="Brief statement (max 200 characters)" maxLength={200} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required />
            </div>
            <div className="bg-stone-50 rounded-md p-3 space-y-1">
              <div className="text-xs text-stone-500 uppercase tracking-wider">Receiving Wallet</div>
              <div className="font-mono text-xs text-stone-700">{shortAddress(publicKey)}</div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting</> : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: "Under Review", variant: "yellow", icon: Clock },
    approved: { label: "Approved", variant: "green", icon: CheckCircle2 },
    rejected: { label: "Not Selected", variant: "destructive", icon: XCircle },
  };
  const { label, variant, icon: Icon } = config[status] || config.pending;
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" /> {label}
    </Badge>
  );
}

export default function StudentPortal() {
  const { publicKey, balance } = useWallet();
  const { pools, myApplications, activityFeed, applyToPool } = useApp();
  const [filter, setFilter] = useState("All");
  const [applyPool, setApplyPool] = useState(null);
  const [tab, setTab] = useState("browse");

  const filtered = filter === "All" ? pools : pools.filter(p => p.field === filter);

  const myAppPoolIds = new Set(myApplications.map(a => a.poolId));

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Syne'] text-2xl font-extrabold text-stone-900 tracking-tight">Student Portal</h1>
          <p className="text-sm text-stone-500 mt-1">Browse scholarships and track your applications.</p>
        </div>

        {/* Wallet strip */}
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap items-center gap-6">
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Wallet</div>
              <div className="font-mono text-sm font-medium text-stone-900">{shortAddress(publicKey)}</div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Balance</div>
              <div className="font-['Syne'] font-bold text-stone-900">{formatXLM(balance)} XLM</div>
            </div>
            {myApplications.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-8 hidden sm:block" />
                <div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">Applications</div>
                  <div className="font-['Syne'] font-bold text-stone-900">{myApplications.length}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-stone-200">
          {["browse", "applications", "activity"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {t === "applications" ? `My Applications${myApplications.length > 0 ? ` (${myApplications.length})` : ""}` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Browse tab */}
        {tab === "browse" && (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {FIELDS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                    filter === f ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(pool => {
                const pct = Math.min(100, Math.round((pool.raised / pool.goal) * 100));
                const hasApplied = myAppPoolIds.has(pool.id);
                return (
                  <Card key={pool.id} className="flex flex-col">
                    <div className={`h-1 rounded-t-lg ${pct >= 100 ? "bg-green-400" : "bg-[#F4956A]"}`} />
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">{pool.field}</Badge>
                        <span className="text-xs text-stone-400 flex-shrink-0">{pool.daysLeft}d left</span>
                      </div>
                      <h3 className="font-['Syne'] font-bold text-stone-900 mb-2 leading-snug">{pool.title}</h3>
                      <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">{pool.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-4">
                        <MapPin className="w-3 h-3" /> {pool.location}
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-500">{pool.raised} XLM raised</span>
                          <span className="font-semibold text-stone-900">{pct}%</span>
                        </div>
                        <Progress value={pct} />
                        <div className="text-xs text-stone-400">Goal: {pool.goal} XLM</div>
                      </div>
                      <Button
                        variant={hasApplied ? "secondary" : "default"}
                        size="sm"
                        className="w-full"
                        onClick={() => !hasApplied && setApplyPool(pool)}
                        disabled={hasApplied || pct >= 100}
                      >
                        {pct >= 100 ? "Fully Funded" : hasApplied ? "Applied" : "Apply Now"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* My Applications tab */}
        {tab === "applications" && (
          <div className="space-y-3">
            {myApplications.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No applications yet. Browse scholarships and apply.</p>
              </div>
            ) : (
              myApplications.map((app, i) => {
                const pool = pools.find(p => p.id === app.poolId);
                return (
                  <Card key={i}>
                    <CardContent className="p-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-['Syne'] font-bold text-stone-900 mb-1">{pool?.title}</div>
                        <div className="text-xs text-stone-500 mb-2">{app.institution}</div>
                        <div className="text-xs text-stone-400">{app.reason?.slice(0, 100)}...</div>
                      </div>
                      <StatusBadge status={app.status} />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Activity tab */}
        {tab === "activity" && (
          <div className="space-y-2">
            {activityFeed.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <p className="text-sm">No activity yet. Actions will appear here in real time.</p>
              </div>
            ) : (
              activityFeed.map(ev => (
                <div key={ev.id} className="flex items-center justify-between py-3 px-4 bg-white rounded-md border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4956A]" />
                    <span className="text-sm text-stone-700">{ev.message}</span>
                  </div>
                  <span className="text-xs text-stone-400 flex-shrink-0 ml-4">
                    {new Date(ev.time).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {applyPool && (
        <ApplyDialog
          pool={applyPool}
          open={!!applyPool}
          onClose={() => setApplyPool(null)}
          onApplied={(poolId, app) => { applyToPool(poolId, app); setApplyPool(null); setTab("applications"); }}
        />
      )}
    </div>
  );
}
