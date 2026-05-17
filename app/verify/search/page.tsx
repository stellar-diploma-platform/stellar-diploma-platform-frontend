"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifySearchPage() {
  const router = useRouter();
  const [tokenId, setTokenId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tokenId.trim()) router.push(`/verify/result?tokenId=${tokenId.trim()}`);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Verify Diploma</h1>
        <p className="text-slate-400 text-center mb-8">
          Enter a diploma token ID or scan a QR code to verify authenticity.
        </p>

        <div className="bg-slate-800 rounded-xl p-6 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="Token ID (e.g. 42)"
              required
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-500 text-lg"
            />
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition text-lg"
            >
              Verify
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/verify/qr-scan" className="text-emerald-400 hover:underline text-sm">
            📷 Scan QR Code instead →
          </Link>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          This verification is public and does not require an account.
        </p>
      </div>
    </div>
  );
}
