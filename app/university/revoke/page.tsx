"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { diplomaApi } from "@/lib/api";
import { Diploma } from "@/lib/types";

export default function RevokePage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    diplomaApi.list().then((r) => setDiplomas(r.data)).catch(() => {});
  }, []);

  async function revoke(tokenId: string) {
    setLoading(tokenId);
    try {
      await diplomaApi.revoke(tokenId);
      setDiplomas((prev) => prev.map((d) => d.tokenId === tokenId ? { ...d, revoked: true } : d));
      toast.success(`Token #${tokenId} revoked`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Revocation failed");
    } finally {
      setLoading(null);
    }
  }

  const active = diplomas.filter((d) => !d.revoked);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Revoke Diplomas</h1>
      {active.length === 0 ? (
        <p className="text-slate-400">No active diplomas to revoke.</p>
      ) : (
        <div className="space-y-3">
          {active.map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
              <div>
                <p className="font-medium">{d.studentName}</p>
                <p className="text-sm text-slate-400">
                  Token #{d.tokenId} · {d.degree}{d.major ? ` — ${d.major}` : ""} · {new Date(d.issuedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => revoke(d.tokenId)}
                disabled={loading === d.tokenId}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm rounded-lg transition"
              >
                {loading === d.tokenId ? "Revoking..." : "Revoke"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
