import { BarChart3Icon, CheckCircle2Icon, Clock3Icon, Loader2Icon, StarIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useSessionAnalytics } from "../hooks/useSessions";

const LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  unknown: "Not recorded",
};

const formatDuration = (totalMinutes) => {
  const minutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${remainingMinutes}mins`;
  if (!remainingMinutes) return `${hours}h`;
  return `${hours}h ${remainingMinutes}mins`;
};

function Breakdown({ title, values, color = "bg-primary" }) {
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
  const maximum = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <section className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="space-y-4 mt-5">
        {entries.map(([key, count]) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold">{LABELS[key] || key}</span>
              <span className="text-base-content/55">{count}</span>
            </div>
            <div className="h-2.5 bg-base-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / maximum) * 100}%` }} />
            </div>
          </div>
        ))}
        {!entries.length && <p className="text-sm text-base-content/50">Complete interviews to see this breakdown.</p>}
      </div>
    </section>
  );
}

function AnalyticsPage() {
  const { data, isLoading, isError } = useSessionAnalytics();
  const analytics = data?.analytics;
  const monthlyMaximum = Math.max(1, ...(analytics?.monthlyActivity || []).map((month) => month.count));
  const cards = [
    { label: "Total interviews", value: analytics?.total || 0, icon: <BarChart3Icon className="size-5" /> },
    { label: "Completed", value: analytics?.completed || 0, icon: <CheckCircle2Icon className="size-5" /> },
    { label: "Average duration", value: formatDuration(analytics?.averageDurationMinutes), icon: <Clock3Icon className="size-5" /> },
    { label: "Average rating", value: analytics?.averageRating ? `${analytics.averageRating} / 5` : "Not rated", icon: <StarIcon className="size-5" /> },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-7">
          <p className="text-sm font-bold text-primary">Performance</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">Interview analytics</h1>
          <p className="text-base-content/60 mt-2">A clear view of your interview activity and coverage.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2Icon className="size-10 animate-spin text-primary" /></div>
        ) : isError ? (
          <div className="alert alert-error">Unable to load analytics.</div>
        ) : (
          <div className="space-y-5">
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {cards.map(({ label, value, icon }) => (
                <div key={label} className="bg-base-100 border border-base-300 rounded-lg p-5 flex items-start justify-between gap-4">
                  <div><p className="text-sm text-base-content/55">{label}</p><p className="text-2xl font-black mt-2">{value}</p></div>
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)] gap-5">
              <div className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6">
                <h2 className="text-xl font-black">Activity over six months</h2>
                <div className="h-56 mt-6 flex items-end gap-3 sm:gap-5 border-b border-base-300">
                  {(analytics?.monthlyActivity || []).map((month) => (
                    <div key={month.label} className="flex-1 h-full flex flex-col justify-end items-center gap-2 min-w-0">
                      <span className="text-xs font-bold">{month.count}</span>
                      <div className="bg-primary rounded-t-md w-full max-w-16 min-h-1 transition-all" style={{ height: `${Math.max(4, (month.count / monthlyMaximum) * 82)}%` }} />
                      <span className="text-xs text-base-content/55 pb-2">{month.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6">
                <h2 className="text-xl font-black">Your roles</h2>
                <div className="mt-7 space-y-5">
                  <div><p className="text-sm text-base-content/55">Hosted interviews</p><p className="text-3xl font-black text-primary mt-1">{analytics?.hosted || 0}</p></div>
                  <div className="border-t border-base-300" />
                  <div><p className="text-sm text-base-content/55">Joined interviews</p><p className="text-3xl font-black text-secondary mt-1">{analytics?.joined || 0}</p></div>
                  <div className="border-t border-base-300" />
                  <div><p className="text-sm text-base-content/55">Currently active</p><p className="text-3xl font-black mt-1">{analytics?.active || 0}</p></div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Breakdown title="Difficulty coverage" values={analytics?.byDifficulty} />
              <Breakdown title="Languages used" values={analytics?.byLanguage} color="bg-secondary" />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default AnalyticsPage;
