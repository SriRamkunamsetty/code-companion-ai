import { Code2, Target, Zap, Trophy, BookOpen, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ submissions: 0, coursesStarted: 0, lessonsCompleted: 0 });

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const [{ count: subCount }, { count: progressCount }] = await Promise.all([
      supabase.from("code_submissions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("user_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
    ]);

    setStats({
      submissions: subCount || 0,
      coursesStarted: 0,
      lessonsCompleted: progressCount || 0,
    });
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Developer";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="text-primary">{displayName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your learning progress this week.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Code2} label="Code Submissions" value={stats.submissions} variant="primary" />
        <StatCard icon={BookOpen} label="Lessons Completed" value={stats.lessonsCompleted} variant="accent" />
        <StatCard icon={Zap} label="XP Points" value={profile?.xp?.toLocaleString() || "0"} variant="warning" />
        <StatCard icon={Trophy} label="Level" value={profile?.level || 1} variant="default" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/courses" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all">
          <BookOpen className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-sm">Continue Learning</h3>
          <p className="text-xs text-muted-foreground mt-1">Pick up where you left off</p>
        </Link>
        <Link to="/editor" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all">
          <Code2 className="w-8 h-8 text-emerald-500 mb-3" />
          <h3 className="font-semibold text-sm">Code Playground</h3>
          <p className="text-xs text-muted-foreground mt-1">Write and execute code</p>
        </Link>
        <Link to="/ai-mentor" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all">
          <Target className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="font-semibold text-sm">AI Mentor</h3>
          <p className="text-xs text-muted-foreground mt-1">Get personalized help</p>
        </Link>
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
