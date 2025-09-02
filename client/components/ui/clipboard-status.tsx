import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Copy } from "lucide-react";
import { isClipboardSupported } from "@/lib/clipboard";

export function ClipboardStatus() {
  const isSupported = isClipboardSupported();

  if (isSupported) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Clipboard Ready
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
      <AlertCircle className="h-3 w-3 mr-1" />
      Manual Copy
    </Badge>
  );
}

interface ClipboardHelpProps {
  className?: string;
}

export function ClipboardHelp({ className }: ClipboardHelpProps) {
  const isSupported = isClipboardSupported();

  if (isSupported) {
    return (
      <p className={`text-xs text-gray-500 ${className}`}>
        <Copy className="h-3 w-3 inline mr-1" />
        Click to copy automatically
      </p>
    );
  }

  return (
    <p className={`text-xs text-gray-500 ${className}`}>
      <AlertCircle className="h-3 w-3 inline mr-1" />
      Automatic copy not available - will show text to copy manually
    </p>
  );
}
