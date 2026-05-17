"use client";
import { useEffect, useState } from "react";
import { universityApi, diplomaApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Diploma, UniversityStats } from "@/lib/types";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const university = useAuthStore((s) => s.university);
  const [stats, setStats] = useState<UniversityStats | null>(null);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);

  useEffect(() => {
    universityApi.stats().then((r) => setStats(r.data)).catch(() => {});
    diplomaApi.list().then((r) => setDiplomas(r.data)).catch(() => {});
  }, []);

  async function handleRevoke(tokenId: string) {
    try {
      await diplomaApi.revoke(tokenId);
      setDiplomas((prev) => prev.map((d) => d.tokenId === tokenId ? { ...d, revoked: true } : d));
      toast.success("Diploma revoked");
    } catch {
      toast.error("Revocation failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {university?.status !== "APPROVED" && (
        <div className="mb-6 p-4 bg-yellow-900/40 border border-yellow-600 rounded-lg text-yellow-300 text-sm">
          Your university is <strong>{university?.status}</strong>. Diploma issuance is disabled until approved by an admin.
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Issued", value: stats.total, color: "bg-blue-700" },
            { label: "Active", value: stats.active, color: "bg-emerald-700" },
            { label: "Revoked", value: stats.revoked, color: "bg-red-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-5`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Recent Diplomas</h2>
      {diplomas.length === 0 ? (
        <p className="text-slate-400">No diplomas issued yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 pr-4">Token ID</th>
                <th className="text-left py-2 pr-4">Student</th>
                <th className="text-left py-2 pr-4">Degree</th>
                <th className="text-left py-2 pr-4">Issued</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {diplomas.map((d) => (
                <tr key={d.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-2 pr-4 font-mono">#{d.tokenId}</td>
                  <td className="py-2 pr-4">{d.studentName}</td>
                  <td className="py-2 pr-4">{d.degree}{d.major ? ` — ${d.major}` : ""}</td>
                  <td className="py-2 pr-4">{new Date(d.issuedAt).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${d.revoked ? "bg-red-800" : "bg-emerald-800"}`}>
                      {d.revoked ? "Revoked" : "Active"}
                    </span>
                  </td>
                  <td className="py-2">
                    {!d.revoked && (
                      <button
                        onClick={() => handleRevoke(d.tokenId)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
