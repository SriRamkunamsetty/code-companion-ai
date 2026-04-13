import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame } from "lucide-react";

const users = [
  { rank: 1, name: "AlgoMaster", xp: 12450, streak: 45, solved: 342, badge: "gold" },
  { rank: 2, name: "CodeNinja", xp: 11200, streak: 38, solved: 298, badge: "silver" },
  { rank: 3, name: "ByteWizard", xp: 10800, streak: 30, solved: 276, badge: "bronze" },
  { rank: 4, name: "DevHero", xp: 9600, streak: 22, solved: 245 },
  { rank: 5, name: "PixelCoder", xp: 8900, streak: 18, solved: 212 },
  { rank: 6, name: "SyntaxStar", xp: 7800, streak: 15, solved: 198 },
  { rank: 7, name: "LogicLord", xp: 7200, streak: 12, solved: 176 },
  { rank: 8, name: "BinaryBoss", xp: 6500, streak: 10, solved: 154 },
];

const rankIcons: Record<string, React.ReactNode> = {
  gold: <Crown className="w-5 h-5 text-warning" />,
  silver: <Medal className="w-5 h-5 text-muted-foreground" />,
  bronze: <Medal className="w-5 h-5 text-orange-400" />,
};

export default function LeaderboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" /> Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Top coders this month.</p>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {users.slice(0, 3).map((u, i) => (
          <motion.div
            key={u.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border border-border bg-card p-4 text-center shadow-card ${
              i === 0 ? "ring-1 ring-warning/30" : ""
            }`}
          >
            <div className="flex justify-center mb-2">
              {rankIcons[u.badge!]}
            </div>
            <div className="w-12 h-12 rounded-full gradient-primary mx-auto flex items-center justify-center text-primary-foreground font-bold text-lg">
              {u.name[0]}
            </div>
            <p className="text-sm font-semibold mt-2">{u.name}</p>
            <p className="text-xl font-bold text-gradient mt-1">{u.xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </motion.div>
        ))}
      </div>

      {/* Full list */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {users.map((u, i) => (
          <motion.div
            key={u.rank}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
          >
            <span className={`w-8 text-center text-sm font-bold ${
              u.rank <= 3 ? "text-warning" : "text-muted-foreground"
            }`}>
              #{u.rank}
            </span>
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
              {u.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.solved} solved</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-warning">
              <Flame className="w-3.5 h-3.5" />
              {u.streak}
            </div>
            <span className="text-sm font-bold text-primary">{u.xp.toLocaleString()} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
