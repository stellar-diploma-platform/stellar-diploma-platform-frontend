import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Stellar Diploma Platform</h1>
      <p className="text-slate-300 mb-10 text-center max-w-md">
        Tamper-proof, non-transferable academic credentials as Soulbound NFTs on Stellar.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/auth/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
          University Login
        </Link>
        <Link href="/auth/register" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition">
          Register University
        </Link>
        <Link href="/verify/search" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition">
          Verify Diploma
        </Link>
        <Link href="/student/my-certificates" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
          Student Portal
        </Link>
      </div>
    </main>
  );
}
