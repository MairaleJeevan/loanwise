"use client";

import { useEffect, useState } from "react";
import { BarChart3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearEvents, getEvents, type AnalyticsEvent, type TrackedEvent } from "@/lib/analytics";

const FUNNEL: { event: AnalyticsEvent; label: string }[] = [
  { event: "landing_viewed", label: "Landing viewed" },
  { event: "eligibility_started", label: "Eligibility started" },
  { event: "business_profile_completed", label: "Business profile completed" },
  { event: "financial_info_completed", label: "Financial info completed" },
  { event: "eligibility_result_viewed", label: "Estimate viewed" },
  { event: "loan_option_selected", label: "Option selected" },
  { event: "document_started", label: "Documents started" },
  { event: "application_started", label: "Application started" },
  { event: "application_submitted", label: "Application submitted" },
  { event: "application_status_viewed", label: "Status viewed" },
];

export default function AnalyticsPage() {
  const [events, setEvents] = useState<TrackedEvent[]>([]);

  useEffect(() => {
    const load = () => setEvents(getEvents());
    load();
    window.addEventListener("loanwise:analytics", load);
    return () => window.removeEventListener("loanwise:analytics", load);
  }, []);

  const count = (e: AnalyticsEvent) => events.filter((x) => x.name === e).length;
  const top = Math.max(1, ...FUNNEL.map((f) => count(f.event)));
  const aiOpened = count("ai_opened");
  const aiAsked = count("ai_question_asked");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[13px] font-semibold tracking-wider text-brand-700 uppercase">
            <BarChart3 className="size-4" aria-hidden /> Developer view
          </p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-slate-900">Journey analytics</h1>
          <p className="mt-1 text-[15px] text-slate-600">Mock event collector, stored in this browser only. No personal or financial values are recorded.</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearEvents}>
          <Trash2 className="size-4" aria-hidden /> Clear events
        </Button>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funnel (event counts this browser)</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2.5">
              {FUNNEL.map((f, i) => {
                const c = count(f.event);
                const prev = i > 0 ? count(FUNNEL[i - 1].event) : null;
                const conv = prev ? Math.round((c / prev) * 100) : null;
                return (
                  <li key={f.event}>
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="text-slate-700">{f.label}</span>
                      <span className="font-medium text-slate-900 tabular-nums">
                        {c}
                        {conv !== null && <span className="ml-2 font-normal text-slate-500">{conv}% of previous</span>}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${(c / top) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardContent>
              <p className="text-[13px] text-slate-500">Loan Assistant opened</p>
              <p className="text-2xl font-semibold text-slate-900 tabular-nums">{aiOpened}</p>
              <p className="mt-3 text-[13px] text-slate-500">Questions asked</p>
              <p className="text-2xl font-semibold text-slate-900 tabular-nums">{aiAsked}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-[13px] text-slate-500">Total events</p>
              <p className="text-2xl font-semibold text-slate-900 tabular-nums">{events.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-base">Event log (latest first)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {events.length === 0 ? (
            <p className="text-[14px] text-slate-500">No events yet. Go through the journey and come back.</p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 font-medium">Properties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...events]
                  .reverse()
                  .slice(0, 100)
                  .map((e, i) => (
                    <tr key={`${e.at}-${i}`}>
                      <td className="py-2 pr-4 whitespace-nowrap text-slate-500 tabular-nums">{new Date(e.at).toLocaleTimeString("en-IN")}</td>
                      <td className="py-2 pr-4 font-mono text-slate-800">{e.name}</td>
                      <td className="py-2 font-mono text-slate-500">{Object.keys(e.props).length ? JSON.stringify(e.props) : "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
