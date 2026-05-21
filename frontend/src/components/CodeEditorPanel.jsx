import React from 'react'
import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/problems";

function CodeEditorPanel({ selectedLanguage, code, isRunning, onLanguageChange, onCodeChange, onRunCode }) {
  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage].icon}
            alt={LANGUAGE_CONFIG[selectedLanguage].name}
            className="size-5 sm:size-6"
          />
          <select className="select select-xs sm:select-sm" value={selectedLanguage} onChange={onLanguageChange}>
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>{lang.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-xs sm:btn-sm gap-1 sm:gap-2" disabled={isRunning} onClick={onRunCode}>
          {isRunning ? (
            <>
              <Loader2Icon className="size-3 sm:size-4 animate-spin" />
              <span className="hidden sm:inline">Running...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <PlayIcon className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Run Code</span>
              <span className="sm:hidden">Run</span>
            </>
          )}
        </button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;