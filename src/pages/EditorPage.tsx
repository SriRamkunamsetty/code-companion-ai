import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { OutputPanel } from "@/components/editor/OutputPanel";
import { Play, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LANGUAGES = [
  { id: "python", label: "Python", defaultCode: '# Welcome to CodeForge!\nprint("Hello, World!")' },
  { id: "javascript", label: "JavaScript", defaultCode: '// Welcome to CodeForge!\nconsole.log("Hello, World!");' },
  { id: "java", label: "Java", defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}' },
  { id: "cpp", label: "C++", defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}' },
];

export default function EditorPage() {
  const [langIndex, setLangIndex] = useState(0);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>();

  const currentLang = LANGUAGES[langIndex];

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setExecutionTime(undefined);

    const start = performance.now();

    try {
      const { data, error: fnError } = await supabase.functions.invoke("execute-code", {
        body: { code, language: currentLang.id },
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
    } catch (err: any) {
      setError(err.message || "Failed to execute code");
      toast.error("Code execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(currentLang.defaultCode);
    setOutput("");
    setError("");
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              {currentLang.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-card overflow-hidden z-50"
              >
                {LANGUAGES.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => handleLangChange(i)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${
                      i === langIndex ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning} className="gradient-primary text-primary-foreground border-0">
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
        <div className="flex-1 min-h-0">
          <CodeEditor language={currentLang.id} value={code} onChange={setCode} />
        </div>
        <div className="h-48 lg:h-auto lg:w-[400px] border-t lg:border-t-0 lg:border-l border-border">
          <OutputPanel output={output} error={error} isRunning={isRunning} executionTime={executionTime} />
        </div>
      </div>
    </div>
  );
}
