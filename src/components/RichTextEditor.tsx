import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading1,
  Heading2,
  Quote,
  Code,
  Minus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  rows = 12,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const wrapSelection = useCallback((wrapper: string) => {
    insertMarkdown(wrapper, wrapper);
  }, [insertMarkdown]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;

    const newText =
      value.substring(0, lineStart) +
      prefix +
      value.substring(lineStart);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [value, onChange]);

  const insertLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const linkText = selectedText || "link text";
    const linkUrl = "https://";

    const newText =
      value.substring(0, start) +
      `[${linkText}](${linkUrl})` +
      value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      // Position cursor at the URL part
      const urlStart = start + linkText.length + 3;
      textarea.setSelectionRange(urlStart, urlStart + linkUrl.length);
    }, 0);
  }, [value, onChange]);

  const tools = [
    { icon: Bold, action: () => wrapSelection("**"), title: "Bold (Ctrl+B)" },
    { icon: Italic, action: () => wrapSelection("*"), title: "Italic (Ctrl+I)" },
    { icon: Underline, action: () => wrapSelection("__"), title: "Underline" },
    { type: "divider" },
    { icon: Heading1, action: () => insertAtLineStart("# "), title: "Heading 1" },
    { icon: Heading2, action: () => insertAtLineStart("## "), title: "Heading 2" },
    { type: "divider" },
    { icon: List, action: () => insertAtLineStart("- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertAtLineStart("1. "), title: "Numbered List" },
    { type: "divider" },
    { icon: Quote, action: () => insertAtLineStart("> "), title: "Quote" },
    { icon: Code, action: () => wrapSelection("`"), title: "Inline Code" },
    { icon: Minus, action: () => insertMarkdown("\n---\n"), title: "Horizontal Rule" },
    { type: "divider" },
    { icon: Link2, action: insertLink, title: "Insert Link" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        wrapSelection("**");
      } else if (e.key === "i") {
        e.preventDefault();
        wrapSelection("*");
      } else if (e.key === "k") {
        e.preventDefault();
        insertLink();
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b">
        {tools.map((tool, index) => {
          if (tool.type === "divider") {
            return <div key={index} className="w-px h-6 bg-border mx-1" />;
          }
          const Icon = tool.icon!;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={tool.action}
              title={tool.title}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none font-mono text-sm"
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
        <span>Supports Markdown formatting</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
