import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import { toast } from "sonner";
import { uploadImage } from "@/lib/storage";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Indent,
  List,
  ListOrdered,
  Outdent,
  Quote,
  Underline as UnderlineIcon,
  Undo2,
  Redo2,
  Minus,
  WrapText,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FONTS = [
  { label: "Body serif", value: "" },
  { label: "Display serif", value: '"Playfair Display", Georgia, serif' },
  { label: "Sans", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
];

const MAX_INDENT = 6;

const Indentation = Extension.create({
  name: "indentation",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => Number(element.getAttribute("data-indent")) || 0,
            renderHTML: (attributes) => {
              const level = Number(attributes["indent"]) || 0;
              if (!level) return {};
              return {
                "data-indent": level,
                style: `margin-left:${level * 2}rem`,
              };
            },
          },
        },
      },
    ];
  },
});

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "border-2 border-ink p-2 transition-colors",
        active ? "bg-ink text-background" : "bg-background hover:bg-cream",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    // eslint-disable-next-line react-hooks/exhaustive-deps
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Indentation,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "article-inline-image" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-72 max-h-140 overflow-y-auto px-4 py-3 text-sm outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return <div className="mt-2 border-2 border-ink p-4 text-sm">Loading editor…</div>;

  const indent = (direction: 1 | -1) => {
    const { state, view } = editor;
    const { from, to } = state.selection;
    const tr = state.tr;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!["paragraph", "heading", "blockquote"].includes(node.type.name)) return;
      const current = Number(node.attrs["indent"]) || 0;
      const next = Math.min(MAX_INDENT, Math.max(0, current + direction));
      if (next !== current) tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
    });
    if (tr.docChanged) view.dispatch(tr);
    editor.commands.focus();
  };

  return (
    <div className="mt-2 border-2 border-ink bg-background">
      <div className="flex flex-wrap gap-1 border-b-2 border-ink bg-cream p-2">
        <select
          aria-label="Text style"
          className="label-xs border-2 border-ink bg-background px-2 py-1"
          value={
            editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : "p"
          }
          onChange={(event) => {
            const chain = editor.chain().focus();
            if (event.target.value === "p") chain.setParagraph().run();
            else chain.setHeading({ level: event.target.value === "h2" ? 2 : 3 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
        </select>

        <select
          aria-label="Font"
          className="label-xs border-2 border-ink bg-background px-2 py-1"
          value={(editor.getAttributes("textStyle")["fontFamily"] as string) ?? ""}
          onChange={(event) => {
            const chain = editor.chain().focus();
            if (event.target.value) chain.setFontFamily(event.target.value).run();
            else chain.unsetFontFamily().run();
          }}
        >
          {FONTS.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolButton>

        {(["left", "center", "right", "justify"] as const).map((align) => (
          <ToolButton
            key={align}
            label={`Align ${align}`}
            active={editor.isActive({ textAlign: align })}
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
          >
            {align === "left" ? (
              <AlignLeft className="h-3.5 w-3.5" />
            ) : align === "center" ? (
              <AlignCenter className="h-3.5 w-3.5" />
            ) : align === "right" ? (
              <AlignRight className="h-3.5 w-3.5" />
            ) : (
              <AlignJustify className="h-3.5 w-3.5" />
            )}
          </ToolButton>
        ))}

        <ToolButton label="Increase indent" onClick={() => indent(1)}>
          <Indent className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Decrease indent" onClick={() => indent(-1)}>
          <Outdent className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Line break" onClick={() => editor.chain().focus().setHardBreak().run()}>
          <WrapText className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}