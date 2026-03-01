import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagsInput({
  value,
  onChange,
  placeholder = "Add a tag and press Enter",
  maxTags = 10,
}: TagsInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length >= maxTags ? `Maximum ${maxTags} tags` : placeholder}
        disabled={value.length >= maxTags}
      />
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add a tag. {value.length}/{maxTags} tags used.
      </p>
    </div>
  );
}
