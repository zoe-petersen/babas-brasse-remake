import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Extension, Mark, type Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle,
} from "@tiptap/extension-text-style";
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
const INDENT_SIZE_REM = 1.5;
const INDENTABLE_NODES = new Set(["paragraph", "heading", "blockquote"]);

function cssLengthToRem(value: string) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (value.endsWith("rem") || value.endsWith("em")) return amount;
  if (value.endsWith("pt")) return amount / 12;
  if (value.endsWith("in")) return amount * 6;
  if (value.endsWith("cm")) return amount * 2.3622;
  if (value.endsWith("mm")) return amount * 0.23622;
  return amount / 16;
}

function parseIndentLevel(element: HTMLElement) {
  const savedLevel = Number(element.getAttribute("data-indent"));
  if (Number.isFinite(savedLevel) && savedLevel > 0) {
    return Math.min(MAX_INDENT, Math.round(savedLevel));
  }

  const pastedOffset =
    element.style.marginLeft || element.style.paddingLeft || element.style.textIndent;
  if (!pastedOffset) return 0;
  return Math.min(
    MAX_INDENT,
    Math.max(0, Math.round(cssLengthToRem(pastedOffset) / INDENT_SIZE_REM)),
  );
}

const InlineIndentation = Mark.create({
  name: "inlineIndentation",

  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: (element) => {
          const savedLevel = Number(element.getAttribute("data-inline-indent"));

          return Number.isFinite(savedLevel)
            ? Math.min(MAX_INDENT, Math.max(1, Math.round(savedLevel)))
            : 1;
        },
        renderHTML: (attributes) => {
          const level = Math.min(MAX_INDENT, Math.max(1, Number(attributes["level"]) || 1));

          return {
            "data-inline-indent": level,
            style: `padding-left: ${level * INDENT_SIZE_REM}rem`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-inline-indent]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});

function adjustInlineIndent(editor: Editor, direction: 1 | -1) {
  const currentLevel = Number(editor.getAttributes("inlineIndentation")["level"]);
  const safeCurrentLevel = Number.isFinite(currentLevel) ? currentLevel : 0;
  const nextLevel = Math.min(MAX_INDENT, Math.max(0, safeCurrentLevel + direction));

  if (nextLevel === safeCurrentLevel) return true;

  const chain = editor.chain().focus();

  return nextLevel === 0
    ? chain.unsetMark("inlineIndentation").run()
    : chain.setMark("inlineIndentation", { level: nextLevel }).run();
}

function adjustIndent(editor: Editor, direction: 1 | -1) {
  const { from: selectionFrom, to: selectionTo } = editor.state.selection;
  const hasSelectedText =
    selectionFrom !== selectionTo &&
    editor.state.doc.textBetween(selectionFrom, selectionTo).length > 0;

  if (hasSelectedText) {
    return adjustInlineIndent(editor, direction);
  }

  if (editor.isActive("listItem")) {
    return direction === 1
      ? editor.commands.sinkListItem("listItem")
      : editor.commands.liftListItem("listItem");
  }

  const { state, view } = editor;
  const { from, to, $from } = state.selection;
  const positions = new Set<number>();

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!INDENTABLE_NODES.has(node.type.name)) return;
    positions.add(pos);
    return false;
  });

  if (positions.size === 0) {
    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);
      if (!INDENTABLE_NODES.has(node.type.name)) continue;
      positions.add($from.before(depth));
      break;
    }
  }

  if (positions.size === 0) return false;

  const transaction = state.tr;
  for (const pos of positions) {
    const node = transaction.doc.nodeAt(pos);
    if (!node) continue;
    const current = Number(node.attrs["indent"]) || 0;
    const next = Math.min(MAX_INDENT, Math.max(0, current + direction));
    if (next !== current) {
      transaction.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
    }
  }

  if (transaction.docChanged) view.dispatch(transaction);
  return true;
}

const Indentation = Extension.create({
  name: "indentation",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: parseIndentLevel,
            renderHTML: (attributes) => {
              const level = Number(attributes["indent"]) || 0;
              if (!level) return {};
              return {
                "data-indent": level,
                style: `margin-left: ${level * INDENT_SIZE_REM}rem`,
              };
            },
          },
        },
      },
    ];
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => adjustIndent(this.editor, 1),
      "Shift-Tab": () => adjustIndent(this.editor, -1),
    };
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle.configure({ mergeNestedSpanStyles: true }),
      FontFamily,
      FontSize,
      LineHeight,
      Color,
      BackgroundColor,
      InlineIndentation,
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
        class: "prose-editor min-h-72 max-h-140 overflow-y-auto px-4 py-3 text-sm outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className="mt-2 border-2 border-ink p-4 text-sm">Loading editor…</div>;

  async function insertImage(file: File | undefined) {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "articles/body");
      const caption = window.prompt("Caption for this image (optional)")?.trim() ?? "";
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: caption, title: caption })
        .createParagraphNear()
        .run();
      toast.success("Image added");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const indent = (direction: 1 | -1) => {
    adjustIndent(editor, direction);
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

        <ToolButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
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
        <ToolButton
          label="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Insert image" onClick={() => fileRef.current?.click()}>
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
        </ToolButton>
        <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolButton>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void insertImage(event.target.files?.[0])}
      />
      <EditorContent editor={editor} />
      <p className="border-t border-border bg-cream px-4 py-2 text-xs text-muted-foreground">
        Tip: press Tab to indent and Shift+Tab to outdent. Rich formatting is kept when pasted from
        apps that provide formatted clipboard content.
      </p>
    </div>
  );
}
