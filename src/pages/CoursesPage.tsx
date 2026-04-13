import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight, Star } from "lucide-react";

const categories = ["All", "DSA", "AI/ML", "Web Dev", "System Design"];

const courses = [
  {
    title: "Data Structures & Algorithms",
    description: "Master arrays, trees, graphs, and dynamic programming with hands-on problems.",
    category: "DSA",
    lessons: 48,
    students: 2340,
    duration: "24 hrs",
    rating: 4.8,
    progress: 35,
    gradient: "from-primary to-blue-600",
  },
  {
    title: "Machine Learning Fundamentals",
    description: "Learn ML concepts from regression to neural networks with Python projects.",
    category: "AI/ML",
    lessons: 36,
    students: 1820,
    duration: "18 hrs",
    rating: 4.9,
    progress: 0,
    gradient: "from-accent to-emerald-600",
  },
  {
    title: "Full-Stack Web Development",
    description: "Build modern web apps with React, Node.js, and databases.",
    category: "Web Dev",
    lessons: 52,
    students: 3100,
    duration: "30 hrs",
    rating: 4.7,
    progress: 68,
    gradient: "from-warning to-orange-600",
  },
  {
    title: "System Design Interview Prep",
    description: "Design scalable systems like a senior engineer. URL shorteners to chat apps.",
    category: "System Design",
    lessons: 24,
    students: 980,
    duration: "12 hrs",
    rating: 4.6,
    progress: 0,
    gradient: "from-purple-500 to-pink-600",
  },
];

export default function CoursesPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground mt-1">Master coding with structured learning paths.</p>
      </motion.div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              i === 0
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((course, i) => (
          <motion.div
            key={course.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-xl border border-border bg-card shadow-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className={`h-2 bg-gradient-to-r ${course.gradient}`} />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {course.category}
                  </span>
                  <h3 className="text-lg font-semibold mt-2">{course.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-warning">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-medium">{course.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.lessons} lessons
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {course.students.toLocaleString()}
                </div>
              </div>

              {course.progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-medium">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {course.progress === 0 && (
                <button className="mt-4 flex items-center gap-1.5 text-sm text-primary font-medium group-hover:gap-2.5 transition-all">
                  Start Learning <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
