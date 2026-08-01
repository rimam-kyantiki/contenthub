"use client";
import { signIn } from "next-auth/react";
import { Instagram, AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connect Your Instagram</h1>
          <p className="text-neutral-400 text-sm">We only access your own posts. No passwords stored.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400 font-medium">Connection failed</p>
              <p className="text-xs text-red-400/70 mt-1">Make sure your Instagram is a Business or Creator account.</p>
            </div>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Requirements</h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400" />Instagram Business or Creator account</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400" />You must own the account</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400" />Official Instagram API authorization</li>
          </ul>
        </div>

        <button onClick={() => signIn("instagram", { callbackUrl: "/dashboard" })} className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
          <Instagram className="w-5 h-5" />
          Connect with Instagram
        </button>

        <p className="text-center text-xs text-neutral-500 mt-6">By connecting, you authorize ContentHub to read your Instagram media via the official API.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}