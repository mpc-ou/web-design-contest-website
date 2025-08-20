import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const CodeBlock = ({ 
  data, 
  code, 
  language = 'json', 
  height = 200, 
  className = '',
  showCopy = true 
}) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Convert data object to formatted JSON string if data is provided
  const codeContent = data ? JSON.stringify(data, null, 2) : code;

  useEffect(() => {
    const loadHighlighter = async () => {
      try {
        const { getHighlighter } = await import('shiki');
        const highlighter = await getHighlighter({
          themes: ['github-light', 'github-dark'],
          langs: ['javascript', 'json', 'typescript', 'html', 'css', 'bash']
        });
        
        const highlighted = highlighter.codeToHtml(codeContent, {
          lang: language,
          theme: 'github-light'
        });
        
        setHighlightedCode(highlighted);
      } catch (error) {
        console.error('Failed to load syntax highlighter:', error);
        // Fallback: just display plain text
        setHighlightedCode(`<pre><code>${codeContent}</code></pre>`);
      } finally {
        setLoading(false);
      }
    };

    if (codeContent) {
      loadHighlighter();
    }
  }, [codeContent, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  if (loading) {
    return (
      <Card className={cn("relative", className)}>
        <div 
          className="p-4 bg-muted/50 overflow-auto font-mono text-sm"
          style={{ height: height }}
        >
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("relative group", className)}>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <div 
        className="p-4 bg-muted/50 overflow-auto text-sm border rounded-md"
        style={{ height: height }}
      >
        {highlightedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="[&>pre]:m-0 [&>pre]:p-0 [&>pre]:bg-transparent [&_code]:bg-transparent [&_code]:p-0"
          />
        ) : (
          <pre className="m-0 p-0 font-mono whitespace-pre-wrap">
            <code>{codeContent}</code>
          </pre>
        )}
      </div>
    </Card>
  );
};

export default CodeBlock;