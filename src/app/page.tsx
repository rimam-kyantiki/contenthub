import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 mb-8">
            <Zap className="w-4 h-4 text-yellow-400" />
            Built for creators who own their content
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your Instagram.<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">Your Website.</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            Auto-generate a beautiful, SEO-optimized blog from your Instagram posts. No scraping. No copyright issues. Just your content, your way.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Connect Instagram <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-24 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <Shield className="w-6 h-6 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">100% Legitimate</h3>
            <p className="text-neutral-400 text-sm">Uses Instagram&apos;s official Graph API. No scraping, no bots, no terms violations.</p>
          </div>
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <Globe className="w-6 h-6 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">SEO Optimized</h3>
            <p className="text-neutral-400 text-sm">Every post becomes a search-indexed blog article. Get discovered on Google.</p>
          </div>
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <Zap className="w-6 h-6 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Own Your Analytics</h3>
            <p className="text-neutral-400 text-sm">Track views and engagement on your own domain. No more relying on Instagram.</p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-800 text-center text-neutral-500 text-sm">
        <p>ContentHub — Built for creators who think long-term.</p>
      </footer>
    </div>
  );
}