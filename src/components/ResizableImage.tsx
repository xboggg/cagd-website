import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Resizable image component rendered inside the TipTap editor.
 * Drag the corner/edge handles to resize; width is persisted as an
 * inline style attribute so it survives serialisation to HTML.
 */
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startX.current = e.clientX;
      startWidth.current = containerRef.current?.offsetWidth || 300;
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(100, startWidth.current + diff);
      // Clamp to editor width
      const parent = containerRef.current?.closest(".ProseMirror");
      const maxWidth = parent ? parent.clientWidth : 800;
      const clampedWidth = Math.min(newWidth, maxWidth);
      updateAttributes({ width: clampedWidth });
    },
    [isResizing, updateAttributes],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <NodeViewWrapper className="relative inline-block my-4" style={{ width: width ? `${width}px` : "auto" }}>
      <div
        ref={containerRef}
        className={`relative group inline-block ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
        style={{ width: width ? `${width}px` : "auto" }}
      >
        <img
          src={src}
          alt={alt || ""}
          className="rounded-lg block"
          style={{ width: "100%", height: "auto" }}
          draggable={false}
        />

        {/* Resize handle — bottom-right corner */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: "linear-gradient(135deg, transparent 50%, #3b82f6 50%)",
            borderBottomRightRadius: "0.5rem",
          }}
          title="Drag to resize"
        />

        {/* Resize handle — right edge */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "transparent" }}
        />

        {/* Width indicator while resizing */}
        {isResizing && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded whitespace-nowrap">
            {Math.round(width || 0)}px
          </div>
        )}

        {/* Selection overlay with size presets */}
        {selected && !isResizing && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-1 bg-background border border-border rounded-md shadow-md p-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  const parent = containerRef.current?.closest(".ProseMirror");
                  const maxWidth = parent ? parent.clientWidth : 800;
                  updateAttributes({ width: Math.round((maxWidth * pct) / 100) });
                }}
                className="text-xs px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                title={`${pct}% width`}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/**
 * TipTap extension: replaces the default Image node with a resizable variant.
 * Stores width as an HTML attribute so it persists in the serialised output.
 */
export const ResizableImage = Node.create({
  name: "image",

  group: "block",

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (element) => {
          // Try style width first, then attribute
          const styleWidth = element.style.width;
          if (styleWidth && styleWidth.endsWith("px")) {
            return parseInt(styleWidth, 10);
          }
          const attrWidth = element.getAttribute("width");
          if (attrWidth) return parseInt(attrWidth, 10);
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(
        { class: "rounded-lg max-w-full h-auto my-4" },
        HTMLAttributes,
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
