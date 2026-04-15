import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { OutputPanel } from "@/components/editor/OutputPanel";
import { Play, RotateCcw, ChevronDown, Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const LANGUAGES = [
  { id: "python", label: "Python", defaultCode: '# Welcome to CodeForge!\nprint("Hello, World!")' },
  { id: "javascript", label: "JavaScript", defaultCode: '// Welcome to CodeForge!\nconsole.log("Hello, World!");' },
  { id: "java", label: "Java", defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}' },
  { id: "cpp", label: "C++", defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}' },
];

export default function EditorPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialLang = LANGUAGES.findIndex((l) => l.id === searchParams.get("lang"));
  const initialCode = searchParams.get("code");
  const lessonId = searchParams.get("lesson");

  const [langIndex, setLangIndex] = useState(initialLang >= 0 ? initialLang : 0);
  const [code, setCode] = useState(initialCode || LANGUAGES[initialLang >= 0 ? initialLang : 0].defaultCode);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [showStdin, setShowStdin] = useState(false);

  const currentLang = LANGUAGES[langIndex];

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setExecutionTime(undefined);

    const start = performance.now();

    try {
      const { data, error: fnError } = await supabase.functions.invoke("execute-code", {
        body: { code, language: currentLang.id, stdin: stdin || undefined },
      });

      const elapsed = Math.round(performance.now() - start);
      setExecutionTime(elapsed);

      if (fnError) {
        setError(fnError.message || "Execution failed");
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.stderr || data.compile_output) {
        setError(data.compile_output || data.stderr);
      }
      if (data.stdout) {
        setOutput(data.stdout);
      }
      if (!data.stdout && !data.stderr && !data.compile_output) {
        setOutput("(No output)");
      }

      // Save submission
      if (user) {
        await supabase.from("code_submissions").insert({
          user_id: user.id,
          lesson_id: lessonId || null,
          language: currentLang.id,
          code,
          stdin: stdin || null,
          stdout: data.stdout || null,
          stderr: data.stderr || null,
          compile_output: data.compile_output || null,
          status: data.status?.description || "Unknown",
          execution_time: data.time || null,
          memory: data.memory || null,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute code");
      toast.error("Code execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode || currentLang.defaultCode);
    setOutput("");
    setError("");
    setStdin("");
    setExecutionTime(undefined);
  };

  const handleLangChange = (index: number) => {
    setLangIndex(index);
    setCode(LANGUAGES[index].defaultCode);
    setOutput("");
    setError("");
    setShowLangMenu(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              {currentLang.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]"
              >
                {LANGUAGES.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => handleLangChange(i)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                      i === langIndex ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showStdin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Input
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning} className="bg-primary text-primary-foreground">
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1.5" />
            )}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1">
            <CodeEditor language={currentLang.id} value={code} onChange={setCode} />
          </div>
          {showStdin && (
            <div className="border-t border-border bg-card">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
                <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Standard Input</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input for your program..."
                className="w-full h-24 px-3 py-2 bg-card text-sm font-mono resize-none focus:outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
        </div>
        <div className="h-48 lg:h-auto lg:w-[400px] border-t lg:border-t-0 lg:border-l border-border">
          <OutputPanel output={output} error={error} isRunning={isRunning} executionTime={executionTime} />
        </div>
      </div>
    </div>
  );
}
