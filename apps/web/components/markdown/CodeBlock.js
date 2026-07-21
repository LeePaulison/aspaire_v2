import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { ClipboardIcon } from "@radix-ui/react-icons";
import { Toaster, toast } from "sonner";

const LANGUAGE_TITLES = {
  js: "JavaScript",
  jsx: "React JSX",
  ts: "TypeScript",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",

  bash: "Bash",
  shell: "Shell",
  sh: "Shell",
  powershell: "PowerShell",
  ps1: "PowerShell",

  sql: "SQL",

  c: "C",
  cpp: "C++",
  cxx: "C++",
  cs: "C#",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  go: "Go",
  rust: "Rust",
  python: "Python",
  py: "Python",
  php: "PHP",
  ruby: "Ruby",

  dockerfile: "Dockerfile",
  markdown: "Markdown",
  md: "Markdown",
  text: "Text",
};

export const CodeBlock = (props) => {
  const { className, children, language: languageProp } = props;

  const language = languageProp || className?.replace(/^language-/, "") || "text";

  const getLanguageTitle = (language) =>
    LANGUAGE_TITLES[language.toLowerCase()] || "Code";

  return (
    <div className="rounded-md bg-surface mt-2 w-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-surface-secondary/25 px-3 py-2">
        <span className="text-xs text-foreground-muted font-semibold uppercase tracking-wide">
          {getLanguageTitle(language)}
        </span>
        <Toaster />
        <button
          className="text-xs text-foreground-muted cursor-pointer"
          onClick={() => {
            toast.success("Copied to clipboard!");
            navigator.clipboard.writeText(String(children));
          }}
        >
          <ClipboardIcon className="w-4 h-4" />
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          margin: 0,
          background: "transparent",
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        {String(children)}
      </SyntaxHighlighter>
    </div>
  );
};
