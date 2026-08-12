import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

/** Layout rhythm for body images: full-bleed, offset left, offset right, then repeat. */
const VARIANTS = ["fig-wide", "fig-left", "fig-right"] as const;

/**
 * Wraps body images in figures with an alternating editorial rhythm and pairs
 * adjacent images into a two-up gallery row.
 */
function withFigures(html: string) {
  let index = 0;

  const withFigureTags = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const variant = VARIANTS[index++ % VARIANTS.length];
    return `<figure class="article-figure ${variant}"><span class="fig-frame">${tag}</span></figure>`;
  });

  // Collapse two adjacent figures (with only whitespace/empty paragraphs between) into a gallery row.
  return withFigureTags.replace(
    /(<figure class="article-figure [^"]*">[\s\S]*?<\/figure>)((?:\s|<p><\/p>|<p>\s*<br[^>]*>\s*<\/p>)*)(<figure class="article-figure [^"]*">[\s\S]*?<\/figure>)/gi,
    (_match, first: string, _gap: string, second: string) =>
      `<div class="article-duo">${first.replace(/fig-(wide|left|right)/, "fig-duo")}${second.replace(/fig-(wide|left|right)/, "fig-duo")}</div>`,
  );
}

/** Renders article bodies written in the admin rich-text editor, with a fallback for plain text. */
export function ArticleBody({ body }: { body: string | null }) {
  const value = body ?? "";
  const isHtml =
    /<\/?(p|h[1-6]|ul|ol|li|blockquote|br|hr|strong|em|u|s|a|span|div|pre|code|img|figure)\b/i.test(
      value,
    );
  const rendered = useMemo(() => (isHtml ? withFigures(value) : ""), [isHtml, value]);
  const [zoom, setZoom] = useState<{ src: string; caption: string } | null>(null);

  const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== "IMG") return;
    const img = target as HTMLImageElement;
    setZoom({ src: img.currentSrc || img.src, caption: img.title || img.alt || "" });
  }, []);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (isHtml) {
    return (
      <>
        <div
          className="article-html mx-auto mt-12 max-w-2xl text-lg leading-relaxed"
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
        {zoom && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged image"
            className="fixed inset-0 z-100 flex items-center justify-center bg-ink/90 p-4 sm:p-10"
            onClick={() => setZoom(null)}
          >
            <button
              type="button"
              aria-label="Close image"
              className="label-xs absolute top-5 right-5 inline-flex items-center gap-2 border-2 border-cream px-3 py-2 text-cream"
              onClick={() => setZoom(null)}
            >
              <X className="h-3.5 w-3.5" />
              Close
            </button>
            <figure
              className="flex max-h-full max-w-full flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoom.src}
                alt={zoom.caption}
                className="h-auto max-h-[80vh] w-auto max-w-full border-2 border-cream object-contain"
              />
              {zoom.caption && (
                <figcaption className="label-xs mt-4 text-center text-cream">
                  {zoom.caption}
                </figcaption>
              )}
            </figure>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto mt-12 max-w-2xl space-y-6 text-center text-lg leading-relaxed">
      {value.split("\n\n").map((paragraph, index) => (
        <p
          key={index}
          className={
            index === 0 ? "text-2xl leading-snug" : "border-t border-border pt-6 text-base"
          }
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
