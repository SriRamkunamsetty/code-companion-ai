import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export function StreakCard() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const active = [true, true, true, true, true, false, false];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-warning" />
        <h3 className="text-sm font-semibold">5 Day Streak</h3>
      </div>
      <div className="flex gap-2">
        {days.map((d, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex-1 flex flex-col items-center gap-1.5`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                active[i]
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {d}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
