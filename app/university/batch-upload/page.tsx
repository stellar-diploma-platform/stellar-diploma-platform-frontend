"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { diplomaApi } from "@/lib/api";
import { BatchResult } from "@/lib/types";
import { useAuthStore } from "@/lib/store";

export default function BatchUploadPage() {
  const university = useAuthStore((s) => s.university);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  if (university?.status !== "APPROVED") {
    return (
      <div className="p-6 bg-yellow-900/40 border border-yellow-600 rounded-lg text-yellow-300">
        Your university must be <strong>APPROVED</strong> before issuing diplomas.
      </div>
    );
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const { data } = await diplomaApi.batch(file);
      setResults(data);
      const ok = data.filter((r: BatchResult) => r.success).length;
      toast.success(`${ok}/${data.length} diplomas issued`);
    } catch {
      toast.error("Batch upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Batch Upload</h1>
      <p className="text-slate-400 text-sm mb-6">
        Upload a CSV with columns: <code className="bg-slate-800 px-1 rounded">studentWallet,studentName,degree,major</code>
      </p>

      <form onSubmit={handleUpload} className="flex gap-3 mb-6">
        <input
          type="file"
          accept=".csv"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 file:mr-3 file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Results</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm ${
                  r.success ? "bg-emerald-900/40 border border-emerald-700" : "bg-red-900/40 border border-red-700"
                }`}
              >
                <span>{r.studentName || r.studentWallet}</span>
                <span>{r.success ? `Token #${r.tokenId}` : r.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
