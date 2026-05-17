"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { diplomaApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function IssueDiplomaPage() {
  const router = useRouter();
  const university = useAuthStore((s) => s.university);
  const [form, setForm] = useState({ studentWallet: "", studentName: "", degree: "", major: "" });
  const [loading, setLoading] = useState(false);

  if (university?.status !== "APPROVED") {
    return (
      <div className="p-6 bg-yellow-900/40 border border-yellow-600 rounded-lg text-yellow-300">
        Your university must be <strong>APPROVED</strong> before issuing diplomas.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.degree.length > 9) {
      toast.error("Degree must be ≤ 9 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await diplomaApi.issue(form);
      toast.success(`Diploma issued! Token ID: ${data.tokenId}`);
      router.push("/university/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Failed to issue diploma");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Issue Diploma</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Student Stellar Wallet</label>
          <input
            required
            value={form.studentWallet}
            onChange={(e) => setForm({ ...form, studentWallet: e.target.value })}
            placeholder="GXYZ..."
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Student Name</label>
          <input
            required
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Degree <span className="text-xs text-slate-500">(max 9 chars — e.g. BSc, MBA, PhD)</span>
          </label>
          <input
            required
            maxLength={9}
            value={form.degree}
            onChange={(e) => setForm({ ...form, degree: e.target.value })}
            placeholder="BSc"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">{form.degree.length}/9</p>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Major (optional)</label>
          <input
            value={form.major}
            onChange={(e) => setForm({ ...form, major: e.target.value })}
            placeholder="Computer Science"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
        >
          {loading ? "Issuing..." : "Issue Diploma"}
        </button>
      </form>
    </div>
  );
}
