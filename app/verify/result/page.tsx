"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyApi } from "@/lib/api";
import { VerifyResult } from "@/lib/types";

function ResultContent() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId") || "";
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tokenId) { setError("No token ID provided"); setLoading(false); return; }
    verifyApi.verify(tokenId)
      .then((r) => setResult(r.data))
      .catch(() => setError("Verification request failed"))
      .finally(() => setLoading(false));
  }, [tokenId]);

  if (loading) return <p className="text-slate-400 text-center mt-20">Verifying diploma #{tokenId}...</p>;
  if (error) return <p className="text-red-400 text-center mt-20">{error}</p>;
  if (!result) return null;

  const d = result.diploma;

  return (
    <div className="max-w-lg mx-auto">
      <div className={`rounded-xl p-6 mb-6 border-2 ${result.valid ? "border-emerald-500 bg-emerald-900/20" : "border-red-500 bg-red-900/20"}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{result.valid ? "✅" : "❌"}</span>
          <div>
            <p className="text-xl font-bold">{result.valid ? "Valid Diploma" : "Invalid Diploma"}</p>
            <p className="text-sm text-slate-400">{result.valid ? "This credential is authentic and active." : result.message}</p>
          </div>
        </div>

        {result.valid && d && (
          <div className="grid grid-cols-2 gap-3 text-sm mt-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-slate-400">Student</p>
              <p className="font-medium">{d.studentName}</p>
            </div>
            <div>
              <p className="text-slate-400">Token ID</p>
              <p className="font-mono">#{d.tokenId}</p>
            </div>
            <div>
              <p className="text-slate-400">Degree</p>
              <p className="font-medium">{d.degree}{d.major ? ` — ${d.major}` : ""}</p>
            </div>
            <div>
              <p className="text-slate-400">Issued</p>
              <p>{new Date(d.issuedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Institution</p>
              <p className="font-medium">{d.university?.name}</p>
            </div>
            <div>
              <p className="text-slate-400">Accredited</p>
              <p>{d.university?.accredited ? "✅ Yes" : "❌ No"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Student Wallet</p>
              <p className="font-mono text-xs break-all">{d.studentWallet}</p>
            </div>
            {d.metadataUri && (
              <div className="col-span-2">
                <a
                  href={d.metadataUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-xs"
                >
                  View IPFS Metadata →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/verify/search" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition">
          ← Verify Another
        </Link>
        <Link href="/verify/qr-scan" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition">
          Scan QR
        </Link>
      </div>
    </div>
  );
}

export default function VerifyResultPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold text-center mb-8">Verification Result</h1>
      <Suspense fallback={<p className="text-slate-400 text-center">Loading...</p>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
