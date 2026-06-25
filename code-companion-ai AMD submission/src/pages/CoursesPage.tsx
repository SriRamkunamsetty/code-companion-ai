import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight, GraduationCap, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  estimated_duration: number;
}

interface ProgressCount {
  course_id: string;
  total: number;
  completed: number;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  advanced: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, ProgressCount>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at");

    if (coursesData) {
      setCourses(coursesData as Course[]);

      // Fetch lesson counts and progress per course
      if (user) {
        const progressMap: Record<string, ProgressCount> = {};
        for (const course of coursesData) {
          const { data: modules } = await supabase
            .from("modules")
            .select("id")
            .eq("course_id", course.id);

          if (modules && modules.length > 0) {
            const moduleIds = modules.map((m: any) => m.id);
            const { count: totalLessons } = await supabase
              .from("lessons")
              .select("*", { count: "exact", head: true })
              .in("module_id", moduleIds);

            const { data: lessonIds } = await supabase
              .from("lessons")
              .select("id")
              .in("module_id", moduleIds);

            let completedCount = 0;
            if (lessonIds && lessonIds.length > 0) {
              const { count } = await supabase
                .from("user_progress")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("completed", true)
                .in("lesson_id", lessonIds.map((l: any) => l.id));
              completedCount = count || 0;
            }

            progressMap[course.id] = {
              course_id: course.id,
              total: totalLessons || 0,
              completed: completedCount,
            };
          }
        }
        setProgress(progressMap);
      }
    }
    setLoading(false);
  };

  const allTags = ["All", ...new Set(courses.flatMap((c) => c.tags))];

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || c.tags.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Courses
        </h1>
        <p className="text-muted-foreground mt-1">Master coding with structured learning paths.</p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
              activeFilter === tag
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((course, i) => {
          const prog = progress[course.id];
          const pct = prog && prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/courses/${course.id}`}
                className="block group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${difficultyColors[course.difficulty]}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{course.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {prog?.total || 0} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.estimated_duration}h
                    </div>
                  </div>

                  {pct > 0 ? (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary font-medium">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-1.5 text-sm text-primary font-medium group-hover:gap-2.5 transition-all">
                      Start Learning <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                  {course.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {course.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No courses found.</p>
        </div>
      )}
    </div>
  );
}
