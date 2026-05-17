"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function QrScanPage() {
  const router = useRouter();
  const [manualId, setManualId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Parse token ID from a verification URL or raw number
  function parseTokenId(raw: string): string | null {
    const trimmed = raw.trim();
    // URL pattern: /diploma/42 or /verify/42 or ?tokenId=42
    const urlMatch = trimmed.match(/(?:diploma|verify|token)[\/=](\d+)/i) || trimmed.match(/^(\d+)$/);
    return urlMatch ? urlMatch[1] : null;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const QrScanner = (await import("qr-scanner")).default;
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      const tokenId = parseTokenId(result.data);
      if (tokenId) {
        router.push(`/verify/result?tokenId=${tokenId}`);
      } else {
        toast.error(`QR content not recognized: ${result.data}`);
      }
    } catch {
      toast.error("Could not read QR code from image");
    }
  }

  function handleManual(e: React.FormEvent) {
    e.preventDefault();
    const tokenId = parseTokenId(manualId);
    if (tokenId) {
      router.push(`/verify/result?tokenId=${tokenId}`);
    } else {
      toast.error("Invalid token ID or URL");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Scan QR Code</h1>
        <p className="text-slate-400 text-sm mb-8">
          Upload a QR code image or paste a verification URL to verify a diploma.
        </p>

        {/* Upload QR image */}
        <div className="bg-slate-800 rounded-xl p-6 mb-4">
          <h2 className="font-semibold mb-3">Upload QR Image</h2>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-lg text-slate-400 hover:text-emerald-400 transition text-center"
          >
            <span className="text-4xl block mb-2">📷</span>
            Click to upload QR code image
          </button>
        </div>

        {/* Manual URL / token ID */}
        <div className="bg-slate-800 rounded-xl p-6 mb-4">
          <h2 className="font-semibold mb-3">Paste Verification URL or Token ID</h2>
          <form onSubmit={handleManual} className="flex gap-2">
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="https://verify.../diploma/42  or  42"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition"
            >
              Go
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/verify/search" className="text-slate-400 hover:text-slate-300 text-sm">
            ← Back to search
          </Link>
        </div>
      </div>
    </div>
  );
}
