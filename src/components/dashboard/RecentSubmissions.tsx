import { CheckCircle2, XCircle, Clock } from "lucide-react";

const submissions = [
  { problem: "Two Sum", lang: "Python", status: "accepted", time: "2 min ago" },
  { problem: "Binary Search", lang: "JavaScript", status: "accepted", time: "1 hr ago" },
  { problem: "Merge Sort", lang: "C++", status: "failed", time: "3 hr ago" },
  { problem: "Valid Parentheses", lang: "Java", status: "accepted", time: "5 hr ago" },
  { problem: "Linked List Cycle", lang: "Python", status: "pending", time: "1 day ago" },
];

const statusIcons = {
  accepted: <CheckCircle2 className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  pending: <Clock className="w-4 h-4 text-warning" />,
};

const langColors: Record<string, string> = {
  Python: "bg-primary/10 text-primary",
  JavaScript: "bg-warning/10 text-warning",
  "C++": "bg-accent/10 text-accent",
  Java: "bg-destructive/10 text-destructive",
};

export function RecentSubmissions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="text-sm font-semibold mb-4">Recent Submissions</h3>
      <div className="space-y-3">
        {submissions.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {statusIcons[s.status as keyof typeof statusIcons]}
              <div>
                <p className="text-sm font-medium">{s.problem}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${langColors[s.lang]}`}>
                  {s.lang}
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
