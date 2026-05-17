"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function WalletConnectPage() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function connectFreighter() {
    setLoading(true);
    try {
      // Freighter wallet API
      const freighter = (window as unknown as { freighter?: { getPublicKey: () => Promise<string> } }).freighter;
      if (!freighter) {
        toast.error("Freighter wallet not installed. Install it from freighter.app");
        return;
      }
      const publicKey = await freighter.getPublicKey();
      setAddress(publicKey);
      setConnected(true);
      toast.success("Wallet connected!");
    } catch {
      toast.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setAddress("");
    setConnected(false);
    toast.success("Wallet disconnected");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
        <p className="text-slate-400 text-sm mb-8">
          Connect your Freighter wallet to view and manage your diploma NFTs.
        </p>

        {!connected ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🔗
            </div>
            <h2 className="text-lg font-semibold mb-2">Freighter Wallet</h2>
            <p className="text-slate-400 text-sm mb-6">
              Freighter is the official Stellar browser extension wallet.
            </p>
            <button
              onClick={connectFreighter}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
            >
              {loading ? "Connecting..." : "Connect Freighter"}
            </button>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-sm text-slate-400 hover:text-slate-300"
            >
              Don&apos;t have Freighter? Install it →
            </a>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-400 font-medium">Connected</span>
            </div>
            <p className="text-slate-400 text-xs mb-1">Wallet Address</p>
            <p className="font-mono text-sm break-all bg-slate-700 rounded-lg p-3 mb-4">{address}</p>
            <div className="flex gap-3">
              <Link
                href={`/student/my-certificates`}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium text-center transition"
              >
                View My Diplomas
              </Link>
              <button
                onClick={disconnect}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
