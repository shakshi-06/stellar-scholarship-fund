import { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sendXLMTransaction, submitSignedTransaction, getExplorerUrl, formatXLM, shortAddress, server } from "../utils/stellar";
import { signWithFreighter } from "../utils/freighter";
import { CheckCircle2, Clock, ExternalLink, Loader2, Search, ArrowUpRight, Filter } from "lucide-react";
import { SC_MEMO } from "../context/AppContext";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "urgent", label: "Most Urgent" },
  { value: "least-funded", label: "Least Funded" },
  { value: "most-funded", label: "Most Funded" },
];

const FIELDS = ["All", "Computer Science", "Engineering", "Medicine", "Design", "Physics", "Law", "Arts", "Commerce", "Other"];

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Check if wallet has received SC-FUND tagged payments before (verified badge)
function useVerifiedBadge(studentWallet) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!studentWallet) return;
    const check = async () => {
      try {
        const result = await server.payments()
          .forAccount(studentWallet)
          .limit(50)
          .order("desc")
          .call();
        const hasFund = result.records.some(
          p => p.type === "payment" &&
               p.asset_type === "native" &&
               p.to === studentWallet
        );
        // We check transaction memo via transaction endpoint
        if (hasFund) {
          const txChecks = await Promise.all(
            result.records
              .filter(p => p.type === "payment" && p.asset_type === "native" && p.to === studentWallet)
              .slice(0, 10)
              .map(p => fetch(`https://horizon-testnet.stellar.org/transactions/${p.transaction_hash}`)
                .then(r => r.json())
                .catch(() => null))
          );
          const hasScFund = txChecks.some(tx => tx && tx.memo === SC_MEMO);
          setVerified(hasScFund);
        }
      } catch {}
    };
    check();
  }, [studentWallet]);

  return verified;
}

function FundDialog({ request, open, onClose }) {
  const { publicKey, refreshBalance } = useWallet();
  const { recordFunding } = useApp();
  const [amount, setAmount] = useState("");
  const [state, setState] = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState("");
  const isVerified = useVerifiedBadge(request?.studentWallet);

  const handleFund = async () => {
    setState("building");
    setError("");
    try {
      const { xdr } = await sendXLMTransaction(
        publicKey,
        request.studentWallet,
        amount,
        SC_MEMO
      );
      setState("signing");
      const signed = await signWithFreighter(xdr, publicKey);
      setState("submitting");
      const result = await submitSignedTransaction(signed);
      setTxHash(result.hash);
      recordFunding(request.id, parseFloat(amount), result.hash, publicKey);
      await refreshBalance();
      setState("success");
    } catch (err) {
      const msgs = {
        INSUFFICIENT_BALANCE: "Not enough XLM. Use Get Test XLM in the navbar.",
        USER_DECLINED_SIGN: "Cancelled in Freighter.",
        SIGN_FAILED: "Signing failed. Ensure Freighter is set to Testnet.",
        TX_SUBMIT_FAILED: "Transaction failed. Please try again.",
        AMOUNT_TOO_LOW: "Minimum amount is 1 XLM.",
        INVALID_AMOUNT: "Please enter a valid amount.",
      };
      setError(msgs[err.message] || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  const isProcessing = ["building", "signing", "submitting"].includes(state);
  const stepLabel = {
    building: "Building transaction...",
    signing: "Waiting for Freighter...",
    submitting: "Broadcasting to Stellar...",
  }[state];

  const quickAmounts = [10, 25, 50, 100];
  const remaining = request ? Math.max(0, request.goalXLM - request.raised) : 0;

  const handleClose = () => {
    if (isProcessing) return;
    setState("idle");
    setAmount("");
    setError("");
    setTxHash(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fund this request</DialogTitle>
          <DialogDescription>{request?.purpose}</DialogDescription>
        </DialogHeader>

        {state === "success" ? (
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <CheckCircle2 className="w-4 h-4" /> {amount} XLM sent successfully
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#1e1e1e] space-y-3">
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Transaction Hash</div>
                <div className="font-mono text-xs text-[#666] break-all">{txHash}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Sent To</div>
                <div className="font-mono text-xs text-[#666]">{request?.studentWallet}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Amount</div>
                <div className="font-mono text-sm text-white">{amount} XLM</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Memo</div>
                <div className="font-mono text-xs text-[#f2d94e]">{SC_MEMO}</div>
              </div>
            </div>
            <a
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#444] hover:text-white transition-colors"
            >
              View on Stellar Explorer <ExternalLink className="w-3 h-3" />
            </a>
            <Button className="w-full mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Request info */}
            <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#1e1e1e] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#444]">Raised so far</span>
                <span className="text-white">{request?.raised} / {request?.goalXLM} XLM</span>
              </div>
              <Progress value={Math.min(100, Math.round((request?.raised / request?.goalXLM) * 100))} />
              <div className="text-xs font-mono text-[#f2d94e]">{remaining} XLM still needed</div>
            </div>

            {/* Recipient */}
            <div className="bg-[#0d0d0d] rounded-lg px-3 py-2.5 border border-[#1e1e1e]">
              <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Sending to</div>
              <div className="font-mono text-xs text-[#666] break-all">{request?.studentWallet}</div>
            </div>

            {/* Amount selection */}
            <div className="space-y-2">
              <Label>Amount (XLM)</Label>
              <div className="flex gap-1.5">
                {quickAmounts.map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className={`flex-1 h-8 text-xs font-mono rounded border transition-all ${
                      amount === String(q)
                        ? "border-[#f2d94e]/40 bg-[#f2d94e]/10 text-[#f2d94e]"
                        : "border-[#2a2a2a] text-[#555] hover:border-[#444]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-[#555] font-mono">
                <Loader2 className="w-3 h-3 animate-spin" /> {stepLabel}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleFund}
                disabled={isProcessing || !amount || parseFloat(amount) < 1}
              >
                {isProcessing ? stepLabel : `Send ${amount || "—"} XLM`}
              </Button>
            </div>

            <p className="text-xs text-[#333] font-mono text-center">
              Memo: {SC_MEMO} · Stellar Testnet
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RequestCard({ request, onFund }) {
  const pct = Math.min(100, Math.round((request.raised / request.goalXLM) * 100));
  const remaining = timeLeft(request.expiresAt);
  const expired = remaining === "Expired";
  const isVerified = useVerifiedBadge(request.studentWallet);

  return (
    <div className={`bg-[#0d0d0d] border rounded-xl p-5 flex flex-col gap-4 transition-all ${
      expired ? "border-[#161616] opacity-40" : "border-[#1e1e1e] hover:border-[#2a2a2a]"
    }`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary">{request.field}</Badge>
            {!expired && (
              <Badge variant="amber">
                <Clock className="w-3 h-3" />{remaining}
              </Badge>
            )}
            {expired && <Badge variant="red">Expired</Badge>}
            {isVerified && (
              <Badge variant="green">
                <CheckCircle2 className="w-3 h-3" />Previously funded
              </Badge>
            )}
          </div>
          <span className="text-xs font-mono text-[#333] flex-shrink-0">{request.donorCount} donor{request.donorCount !== 1 ? "s" : ""}</span>
        </div>

        <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{request.purpose}</h3>
        <p className="text-xs text-[#555] leading-relaxed">{request.description}</p>
      </div>

      <div className="flex items-center gap-3 text-xs font-mono text-[#333]">
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

      <Button
        size="sm"
        className="w-full"
        variant={expired || pct >= 100 ? "surface" : "default"}
        onClick={() => !expired && pct < 100 && onFund(request)}
        disabled={expired || pct >= 100}
      >
        {pct >= 100 ? "Fully Funded" : expired ? "Expired" : (
          <><ArrowUpRight className="w-3.5 h-3.5" /> Fund this student</>
        )}
      </Button>
    </div>
  );
}

export default function DonorPortal() {
  const { publicKey, balance } = useWallet();
  const { activeRequests, getDonationsByWallet } = useApp();
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [fundRequest, setFundRequest] = useState(null);

  const myDonations = getDonationsByWallet(publicKey);
  const totalDonated = myDonations.reduce((s, d) => s + d.amount, 0);

  // Filter and sort
  let filtered = activeRequests.filter(r => {
    const matchField = fieldFilter === "All" || r.field === fieldFilter;
    const matchSearch = !search || r.purpose.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchField && matchSearch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "urgent") return new Date(a.expiresAt) - new Date(b.expiresAt);
    if (sort === "least-funded") return (a.raised / a.goalXLM) - (b.raised / b.goalXLM);
    if (sort === "most-funded") return (b.raised / b.goalXLM) - (a.raised / a.goalXLM);
    return 0;
  });

  const tabs = [
    { id: "browse", label: `Browse (${activeRequests.length})` },
    { id: "history", label: `My Donations${myDonations.length > 0 ? ` (${myDonations.length})` : ""}` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">SCHOLARCHAIN / DONOR</div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Donor Dashboard</h1>
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
          {totalDonated > 0 && (
            <>
              <div className="w-px bg-[#1e1e1e] hidden sm:block" />
              <div>
                <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Total Donated</div>
                <div className="font-mono text-sm text-[#f2d94e]">{totalDonated.toFixed(2)} XLM</div>
              </div>
            </>
          )}
          <div className="w-px bg-[#1e1e1e] hidden sm:block" />
          <div>
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">Active Requests</div>
            <div className="font-mono text-sm text-white">{activeRequests.length}</div>
          </div>
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

        {/* Browse tab */}
        {tab === "browse" && (
          <>
            {/* Search + sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="h-9 rounded-md border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white focus-visible:outline-none focus-visible:border-[#444] font-mono"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Field filter */}
            <div className="flex gap-1.5 flex-wrap mb-6">
              {FIELDS.map(f => (
                <button
                  key={f}
                  onClick={() => setFieldFilter(f)}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
                    fieldFilter === f
                      ? "border-[#f2d94e]/40 bg-[#f2d94e]/10 text-[#f2d94e]"
                      : "border-[#1e1e1e] text-[#444] hover:border-[#2a2a2a] hover:text-[#888]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#1e1e1e] rounded-xl text-[#444] text-sm font-mono">
                {activeRequests.length === 0
                  ? "No funding requests yet. Students haven't posted any requests."
                  : "No requests match your filters."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map(r => (
                  <RequestCard key={r.id} request={r} onFund={setFundRequest} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Donation history tab */}
        {tab === "history" && (
          <div className="space-y-3">
            {myDonations.length === 0 ? (
              <div className="text-center py-16 text-[#444] text-sm font-mono">
                No donations made yet.
              </div>
            ) : (
              myDonations.map(d => {
                const req = activeRequests.find(r => r.id === d.requestId);
                return (
                  <div key={d.id} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-sm font-semibold text-white mb-0.5">
                          {req?.purpose || "Request no longer active"}
                        </div>
                        <div className="text-xs font-mono text-[#444]">{timeAgo(d.time)}</div>
                      </div>
                      <div className="text-sm font-semibold text-[#f2d94e] font-mono flex-shrink-0">
                        {d.amount} XLM
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#1a1a1a] space-y-2">
                      <div>
                        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Transaction Hash</div>
                        <div className="font-mono text-xs text-[#666] break-all">{d.txHash}</div>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-0.5">Recipient</div>
                        <div className="font-mono text-xs text-[#666]">{shortAddress(d.from)}</div>
                      </div>
                    </div>
                    <a
                      href={getExplorerUrl(d.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#444] hover:text-white transition-colors mt-3"
                    >
                      View on Stellar Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {fundRequest && (
        <FundDialog
          request={fundRequest}
          open={!!fundRequest}
          onClose={() => setFundRequest(null)}
        />
      )}
    </div>
  );
}
