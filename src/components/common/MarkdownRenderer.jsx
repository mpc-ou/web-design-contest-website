import { useMemo } from 'react';

const MarkdownRenderer = ({ content, className = '' }) => {
  const parsedContent = useMemo(() => {
    if (!content) return '';
    
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
    
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<li')) {
      html = `<p class="mb-4">${html}</p>`;
    }
    
    return html;
  }, [content]);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};

export default MarkdownRenderer;