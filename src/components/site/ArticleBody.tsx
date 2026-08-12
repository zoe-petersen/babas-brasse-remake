const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Wraps captioned images in a figure so the caption renders under the photo. */
function withFigures(html: string) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const title = /title="([^"]*)"/i.exec(tag)?.[1]?.trim();
    if (!title) return `<figure class="article-figure">${tag}</figure>`;
    return `<figure class="article-figure">${tag}<figcaption>${escapeHtml(title)}</figcaption></figure>`;
  });
}

/** Renders article bodies written in the admin rich-text editor, with a fallback for plain text. */
export function ArticleBody({ body }: { body: string | null }) {
  const value = body ?? "";
  const isHtml =
    /<\/?(p|h[1-6]|ul|ol|li|blockquote|br|hr|strong|em|u|s|a|span|div|pre|code|img|figure)\b/i.test(
      value,
    );

  if (isHtml) {
    return (
      <div
        className="article-html mx-auto mt-12 max-w-2xl text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: withFigures(value) }}
      />
    );
  }

  return (
    <div className="mx-auto mt-12 max-w-2xl space-y-6 text-center text-lg leading-relaxed">
      {value.split("\n\n").map((paragraph, index) => (
        <p
          key={index}
          className={index === 0 ? "text-2xl leading-snug" : "border-t border-border pt-6 text-base"}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}