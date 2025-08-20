import { useState } from 'react';

export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetAfter);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  };

  return { copyToClipboard, copied };
}