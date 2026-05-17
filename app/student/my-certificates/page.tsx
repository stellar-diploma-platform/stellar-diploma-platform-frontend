"use client";
import { useState } from "react";
import Link from "next/link";
import { verifyApi } from "@/lib/api";
import { Diploma } from "@/lib/types";
import toast from "react-hot-toast";

export default function MyCertificatesPage() {
  const [wallet, setWallet] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenId) return;
    setLoading(true);
    setDiploma(null);
    try {
      const { data } = await verifyApi.verify(tokenId);
      if (data.valid) {
        setDiploma(data.diploma);
      } else {
        toast.error(data.message || "Diploma not found");
      }
    } catch {
      toast.error("Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <Link href="/student/wallet-connect" className="text-sm text-blue-400 hover:underline">
            Connect Wallet →
          </Link>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <p className="text-slate-400 text-sm mb-4">Enter your diploma token ID to view your certificate.</p>
          <form onSubmit={lookup} className="flex gap-3">
            <input
              type="number"
              placeholder="Token ID (e.g. 42)"
              required
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
            >
              {loading ? "..." : "Lookup"}
            </button>
          </form>
        </div>

        {diploma && (
          <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-xl p-6 border border-blue-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">Official Diploma NFT</p>
                <h2 className="text-xl font-bold">{diploma.studentName}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${diploma.revoked ? "bg-red-700" : "bg-emerald-700"}`}>
                {diploma.revoked ? "Revoked" : "Valid"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Degree</p>
                <p className="font-medium">{diploma.degree}{diploma.major ? ` — ${diploma.major}` : ""}</p>
              </div>
              <div>
                <p className="text-slate-400">Token ID</p>
                <p className="font-mono">#{diploma.tokenId}</p>
              </div>
              <div>
                <p className="text-slate-400">Institution</p>
                <p className="font-medium">{diploma.university?.name || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400">Issued</p>
                <p>{new Date(diploma.issuedAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Wallet</p>
                <p className="font-mono text-xs break-all">{diploma.studentWallet}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex gap-3">
              <Link
                href={`/verify/result?tokenId=${diploma.tokenId}`}
                className="text-sm text-blue-400 hover:underline"
              >
                Share verification link →
              </Link>
              {diploma.metadataUri && (
                <a
                  href={diploma.metadataUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:underline"
                >
                  View metadata →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
