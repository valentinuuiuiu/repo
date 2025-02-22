import React from 'react';
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ 
  code, 
  language = 'typescript', 
  className 
}: CodeBlockProps) {
  return (
    <pre className={cn(
      "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm",
      className
    )}>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}