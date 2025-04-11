"use client"; // This ensures the component is rendered on the client-side

import React, { useState } from "react"; // Import useState here
import MonacoEditor from "@monaco-editor/react"; // Monaco editor import

interface CodeEditorProps {
  language: string;
  defaultValue: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, defaultValue }) => {
  const [code, setCode] = useState(defaultValue); // Hook for managing code state

  return (
    <div className="w-full h-[500px]">
      <MonacoEditor
        height="500px"
        language={language}
        value={code} // Bind Monaco editor value to state
        onChange={(value) => setCode(value || "")} // Update state when code changes
        theme="vs-dark"
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
