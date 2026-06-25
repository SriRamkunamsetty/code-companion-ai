import { motion } from "framer-motion";
import { Search, Filter, CheckCircle2, Circle, Tag } from "lucide-react";
import { useState } from "react";

const problems = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", acceptance: "78%", solved: true },
  { id: 2, title: "Add Two Numbers", difficulty: "Medium", category: "Linked List", acceptance: "42%", solved: true },
  { id: 3, title: "Longest Substring Without Repeating", difficulty: "Medium", category: "Strings", acceptance: "35%", solved: false },
  { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Arrays", acceptance: "38%", solved: false },
  { id: 5, title: "Valid Parentheses", difficulty: "Easy", category: "Stack", acceptance: "82%", solved: true },
  { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked List", acceptance: "65%", solved: false },
  { id: 7, title: "Maximum Subarray", difficulty: "Medium", category: "DP", acceptance: "51%", solved: false },
  { id: 8, title: "Binary Tree Level Order", difficulty: "Medium", category: "Trees", acceptance: "62%", solved: true },
  { id: 9, title: "Word Break", difficulty: "Medium", category: "DP", acceptance: "46%", solved: false },
  { id: 10, title: "LRU Cache", difficulty: "Hard", category: "Design", acceptance: "41%", solved: false },
];

const difficultyColors: Record<string, string> = {
  Easy: "text-success",
  Medium: "text-warning",
  Hard: "text-destructive",
};

export default function PracticePage() {
  const [search, setSearch] = useState("");
  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
        <p className="text-muted-foreground mt-1">Sharpen your skills with coding challenges.</p>
      </motion.div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm font-medium hover:bg-secondary/80 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          Solved: <span className="text-success font-semibold">{problems.filter(p => p.solved).length}</span> / {problems.length}
        </span>
        <span className="text-muted-foreground">
          Easy: <span className="text-success font-semibold">{problems.filter(p => p.difficulty === "Easy").length}</span>
        </span>
        <span className="text-muted-foreground">
          Medium: <span className="text-warning font-semibold">{problems.filter(p => p.difficulty === "Medium").length}</span>
        </span>
        <span className="text-muted-foreground">
          Hard: <span className="text-destructive font-semibold">{problems.filter(p => p.difficulty === "Hard").length}</span>
        </span>
      </div>

      {/* Problem Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 w-10">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Problem</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Difficulty</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  {p.solved ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium hover:text-primary transition-colors">
                    {p.id}. {p.title}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                    {p.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${difficultyColors[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{p.acceptance}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
