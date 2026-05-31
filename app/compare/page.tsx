import type { Metadata } from "next";
import { headers } from "next/headers";
import { getScan } from "@/lib/scanService";
import { clientIp, enforceRateLimit } from "@/lib/rateLimit";
import type { ScanResult } from "@/lib/analysis/types";
import { CompareForm } from "@/components/CompareForm";
import { CompareView } from "@/components/CompareView";
import { ScanErrorState } from "@/components/ScanErrorState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare developers",
  description: "Put two GitHub profiles side by side and see who ships more, who goes deeper.",
};

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams;
  const u1 = typeof sp.u1 === "string" ? sp.u1 : "";
  const u2 = typeof sp.u2 === "string" ? sp.u2 : "";

  let a: ScanResult | null = null;
  let b: ScanResult | null = null;
  let error: unknown = null;
  let errorUser = "";

  if (u1 && u2) {
    try {
      await enforceRateLimit(`page-compare:${clientIp(await headers())}`, { limit: 15, windowSec: 60 });
      a = await getScan(u1);
    } catch (e) {
      error = e;
      errorUser = u1;
    }
    if (!error) {
      try {
        b = await getScan(u2);
      } catch (e) {
        error = e;
        errorUser = u2;
      }
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Compare developers</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Two profiles, side by side. See who ships more, who goes deeper, and who&apos;s more
            experimental.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <CompareForm u1={u1} u2={u2} />
        </div>

        <div className="mt-10">
          {error ? <ScanErrorState error={error} username={errorUser} /> : null}
          {!error && a && b && <CompareView a={a} b={b} />}
          {!error && (!u1 || !u2) && (
            <p className="text-center text-sm text-muted-2">
              Enter two usernames above to see a head-to-head comparison.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
