/** Renders article bodies written in the admin rich-text editor, with a fallback for plain text. */
export function ArticleBody({ body }: { body: string | null }) {
  const value = body ?? "";
  const isHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|br|hr|strong|em|u|s|a|span|div|pre|code)\b/i.test(
    value,
  );

  if (isHtml) {
    return (
      <div
        className="article-html mx-auto mt-12 max-w-2xl text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: value }}
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