import { Code2, Target, Zap, Trophy } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="text-gradient">Developer</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your coding progress this week.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Code2} label="Problems Solved" value={142} change="+12" variant="primary" />
        <StatCard icon={Target} label="Accuracy" value="87%" change="+3%" variant="accent" />
        <StatCard icon={Zap} label="XP Points" value="2,450" variant="warning" />
        <StatCard icon={Trophy} label="Rank" value="#34" variant="default" />
      </div>

      {/* Charts + Streak */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <StreakCard />
      </div>

      {/* Recent */}
      <RecentSubmissions />
    </div>
  );
}
