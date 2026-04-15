
-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  estimated_duration INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are viewable by authenticated users" ON public.courses FOR SELECT TO authenticated USING (is_published = true);

-- Modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules viewable by authenticated users" ON public.modules FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.is_published = true)
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article' CHECK (type IN ('video', 'article', 'coding')),
  content TEXT,
  video_url TEXT,
  starter_code TEXT,
  language TEXT,
  test_cases JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons viewable by authenticated users" ON public.lessons FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.is_published = true
  )
);

-- User progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Code submissions
CREATE TABLE public.code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  stdin TEXT,
  stdout TEXT,
  stderr TEXT,
  compile_output TEXT,
  status TEXT,
  execution_time TEXT,
  memory INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own submissions" ON public.code_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own submissions" ON public.code_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_modules_course ON public.modules(course_id, sort_order);
CREATE INDEX idx_lessons_module ON public.lessons(module_id, sort_order);
CREATE INDEX idx_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_progress_lesson ON public.user_progress(lesson_id);
CREATE INDEX idx_submissions_user ON public.code_submissions(user_id, created_at DESC);
