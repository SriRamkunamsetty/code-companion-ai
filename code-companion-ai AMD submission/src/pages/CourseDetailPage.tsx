import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Circle, Play, FileText, Code2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  estimated_duration: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: string;
  content: string | null;
  starter_code: string | null;
  language: string | null;
  sort_order: number;
  duration_minutes: number;
}

const lessonIcons: Record<string, React.ReactNode> = {
  article: <FileText className="w-4 h-4" />,
  coding: <Code2 className="w-4 h-4" />,
  video: <Play className="w-4 h-4" />,
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId, user]);

  const fetchCourse = async () => {
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (!courseData) { setLoading(false); return; }
    setCourse(courseData as Course);

    const { data: modulesData } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order");

    if (modulesData) {
      setModules(modulesData as Module[]);
      setExpandedModules(new Set(modulesData.map((m: any) => m.id)));

      const lessonsMap: Record<string, Lesson[]> = {};
      for (const mod of modulesData) {
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", mod.id)
          .order("sort_order");
        if (lessonData) lessonsMap[mod.id] = lessonData as Lesson[];
      }
      setLessons(lessonsMap);

      // Set first lesson as active
      const firstMod = modulesData[0];
      if (firstMod && lessonsMap[firstMod.id]?.length > 0) {
        setActiveLesson(lessonsMap[firstMod.id][0]);
      }

      // Fetch user progress
      if (user) {
        const allLessonIds = Object.values(lessonsMap).flat().map((l) => l.id);
        if (allLessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", true)
            .in("lesson_id", allLessonIds);
          if (progressData) {
            setCompletedLessons(new Set(progressData.map((p: any) => p.lesson_id)));
          }
        }
      }
    }
    setLoading(false);
  };

  const markComplete = async () => {
    if (!activeLesson || !user) return;

    const { error } = await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: activeLesson.id,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    if (!error) {
      setCompletedLessons((prev) => new Set([...prev, activeLesson.id]));
    }
  };

  const allLessons = modules.flatMap((m) => lessons[m.id] || []);
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Course not found.</p>
        <Link to="/courses" className="text-primary mt-2 inline-block">← Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate">{course.title}</h1>
          <p className="text-xs text-muted-foreground">
            {completedLessons.size}/{allLessons.length} lessons completed
          </p>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{allLessons.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.estimated_duration}h</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Lesson list */}
        <div className="w-72 border-r border-border bg-card overflow-y-auto shrink-0 hidden lg:block">
          {modules.map((mod) => (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors border-b border-border"
              >
                {expandedModules.has(mod.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">{mod.title}</span>
              </button>
              {expandedModules.has(mod.id) && (
                <div>
                  {(lessons[mod.id] || []).map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isCompleted = completedLessons.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted/50 border-l-2 border-transparent"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="shrink-0">{lessonIcons[lesson.type]}</span>
                        )}
                        <span className="truncate text-left">{lesson.title}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{lesson.duration_minutes}m</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <motion.div
              key={activeLesson.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto p-6 lg:p-8"
            >
              {/* Lesson header */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  {lessonIcons[activeLesson.type]}
                  {activeLesson.type}
                </span>
                <span>·</span>
                <span>{activeLesson.duration_minutes} min</span>
              </div>
              <h2 className="text-xl font-bold mb-6">{activeLesson.title}</h2>

              {/* Content */}
              {activeLesson.type === "coding" ? (
                <div className="space-y-4">
                  {activeLesson.content && (
                    <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary">
                      <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                    </div>
                  )}
                  <Button
                    onClick={() => navigate(`/editor?code=${encodeURIComponent(activeLesson.starter_code || "")}&lang=${activeLesson.language || "python"}&lesson=${activeLesson.id}`)}
                    className="bg-primary text-primary-foreground"
                  >
                    <Code2 className="w-4 h-4 mr-2" /> Open in Editor
                  </Button>
                </div>
              ) : activeLesson.content ? (
                <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm">
                  <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">No content available yet.</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                {prevLesson ? (
                  <Button variant="ghost" size="sm" onClick={() => setActiveLesson(prevLesson)}>
                    ← {prevLesson.title}
                  </Button>
                ) : <div />}

                <Button
                  onClick={markComplete}
                  disabled={completedLessons.has(activeLesson.id)}
                  variant={completedLessons.has(activeLesson.id) ? "outline" : "default"}
                  size="sm"
                >
                  {completedLessons.has(activeLesson.id) ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Completed</>
                  ) : (
                    <><Circle className="w-4 h-4 mr-1.5" /> Mark Complete</>
                  )}
                </Button>

                {nextLesson ? (
                  <Button variant="ghost" size="sm" onClick={() => setActiveLesson(nextLesson)}>
                    {nextLesson.title} →
                  </Button>
                ) : <div />}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a lesson to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
