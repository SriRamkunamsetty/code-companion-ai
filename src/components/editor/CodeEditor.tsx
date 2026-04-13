import Editor from "@monaco-editor/react";
import { useState } from "react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          wordWrap: "on",
        }}
      />
    </div>
  );
}
