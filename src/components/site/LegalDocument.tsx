type LegalListBlock =
  { type: "ordered-list"; items: string[] } | { type: "unordered-list"; items: string[] };

type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; number: string; title: string }
  | LegalListBlock;

type LegalSection = {
  number: string | undefined;
  title: string;
  id: string;
  emphasis: boolean;
  blocks: LegalBlock[];
};

type ParsedDocument = {
  title: string;
  lastUpdated: string;
  introduction: string[];
  sections: LegalSection[];
};

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseDocument(document: string): ParsedDocument {
  const lines = document
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines.shift() ?? "Legal information";
  const lastUpdated = (lines.shift() ?? "").replace(/^Last updated:\s*/i, "");
  const introduction: string[] = [];
  const sections: LegalSection[] = [];
  let currentSection: LegalSection | null = null;

  const addListItem = (type: LegalListBlock["type"], item: string) => {
    if (!currentSection) return;
    const previous = currentSection.blocks.at(-1);
    if (previous && "items" in previous && previous.type === type) {
      previous.items.push(item);
      return;
    }
    currentSection.blocks.push(
      type === "ordered-list"
        ? { type: "ordered-list", items: [item] }
        : { type: "unordered-list", items: [item] },
    );
  };

  for (const line of lines) {
    const numberedHeading = line.match(/^(\d+)\.\s+(.+)$/);
    const subsectionHeading = line.match(/^(\d+\.\d+)\s+(.+)$/);
    const isStandaloneHeading =
      line.length > 3 && line === line.toUpperCase() && /[A-Z]/.test(line);

    if (numberedHeading || isStandaloneHeading) {
      const number = numberedHeading?.[1];
      const sectionTitle = numberedHeading?.[2] ?? line;
      currentSection = {
        number,
        title: sectionTitle,
        id: `${number ? `section-${number}-` : ""}${slugifyHeading(sectionTitle)}`,
        emphasis: isStandaloneHeading,
        blocks: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      introduction.push(line);
      continue;
    }

    if (subsectionHeading) {
      const subsectionNumber = subsectionHeading[1];
      const subsectionTitle = subsectionHeading[2];
      if (!subsectionNumber || !subsectionTitle) continue;
      currentSection.blocks.push({
        type: "subheading",
        number: subsectionNumber,
        title: subsectionTitle,
      });
      continue;
    }

    if (/^[\u2022\uF0B7]/.test(line)) {
      addListItem("unordered-list", line.replace(/^[\u2022\uF0B7]\s*/, ""));
      continue;
    }

    const orderedItem = line.match(/^\d+\.(\S.*)$/);
    const orderedItemText = orderedItem?.[1];
    if (orderedItemText) {
      addListItem("ordered-list", orderedItemText);
      continue;
    }

    currentSection.blocks.push({ type: "paragraph", text: line });
  }

  return { title, lastUpdated, introduction, sections };
}

function LinkedText({ children }: { children: string }) {
  const contactPattern = /(submissions@babasandbrasse\.co\.za|www\.babasandbrasse\.co\.za)/g;
  return children.split(contactPattern).map((part, index) => {
    if (part === "submissions@babasandbrasse.co.za") {
      return (
        <a key={`${part}-${index}`} href={`mailto:${part}`} className="font-semibold underline">
          {part}
        </a>
      );
    }
    if (part === "www.babasandbrasse.co.za") {
      return (
        <a
          key={`${part}-${index}`}
          href="https://www.babasandbrasse.co.za"
          className="font-semibold underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function LegalBlocks({ blocks, inverted = false }: { blocks: LegalBlock[]; inverted?: boolean }) {
  return (
    <div
      className={`mt-5 space-y-4 text-[0.98rem] leading-7 ${
        inverted ? "text-primary-foreground/90" : "text-muted-foreground"
      }`}
    >
      {blocks.map((block, index) => {
        if (block.type === "subheading") {
          return (
            <h3
              key={`${block.number}-${index}`}
              className={`pt-3 text-xl ${inverted ? "text-primary-foreground" : "text-foreground"}`}
            >
              <span className="mr-2 text-magenta">{block.number}</span>
              {block.title}
            </h3>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`unordered-${index}`} className="ml-5 list-disc space-y-2 marker:text-magenta">
              {block.items.map((item) => (
                <li key={item} className="pl-1">
                  <LinkedText>{item}</LinkedText>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol
              key={`ordered-${index}`}
              className="ml-5 list-decimal space-y-2 marker:font-label marker:font-bold marker:text-magenta"
            >
              {block.items.map((item) => (
                <li key={item} className="pl-2">
                  <LinkedText>{item}</LinkedText>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.text}-${index}`}>
            <LinkedText>{block.text}</LinkedText>
          </p>
        );
      })}
    </div>
  );
}

export function LegalDocument({
  document,
  eyebrow,
  summary,
  documentNumber,
}: {
  document: string;
  eyebrow: string;
  summary: string;
  documentNumber: string;
}) {
  const parsed = parseDocument(document);

  return (
    <div>
      <header className="border-b-2 border-ink bg-forest">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.35fr_0.65fr]">
          <div className="bg-cream px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <p className="label-xs text-magenta">{eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
              {parsed.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {summary}
            </p>
            <p className="label-xs mt-8 inline-block border-2 border-ink bg-background px-4 py-3">
              Last updated {parsed.lastUpdated}
            </p>
          </div>
          <div className="relative hidden min-h-full overflow-hidden lg:block">
            <span
              aria-hidden
              className="absolute -bottom-12 right-5 font-display text-[15rem] font-bold leading-none text-ink/15"
            >
              {documentNumber}
            </span>
            <div className="absolute left-10 top-10 h-28 w-28 rotate-12 border-2 border-ink bg-magenta" />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:py-20">
        <aside className="hidden lg:block">
          <nav aria-label={`${parsed.title} contents`} className="sticky top-28">
            <p className="label-xs border-b-2 border-magenta pb-3">On this page</p>
            <ol className="mt-5 max-h-[calc(100vh-11rem)] space-y-3 overflow-y-auto pr-4 text-sm">
              {parsed.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="group flex gap-2 hover:underline">
                    {section.number && (
                      <span className="label-xs mt-1 w-5 shrink-0 text-magenta">
                        {section.number.padStart(2, "0")}
                      </span>
                    )}
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 max-w-4xl">
          {parsed.introduction.length > 0 && (
            <div className="hard-shadow mb-14 border-2 border-ink bg-forest p-6 text-primary-foreground sm:p-8">
              {parsed.introduction.map((paragraph, index) => (
                <p key={`${paragraph}-${index}`} className="text-base leading-7 not-first:mt-4">
                  <LinkedText>{paragraph}</LinkedText>
                </p>
              ))}
            </div>
          )}

          <div className="space-y-12">
            {parsed.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={`scroll-mt-28 border-t-2 border-ink pt-7 ${
                  section.emphasis ? "border-2 bg-forest p-6 text-primary-foreground sm:p-8" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {section.number && (
                    <span className="label-xs mt-1 grid h-9 w-9 shrink-0 place-items-center bg-magenta text-ink">
                      {section.number.padStart(2, "0")}
                    </span>
                  )}
                  <h2 className="text-2xl leading-tight sm:text-3xl">{section.title}</h2>
                </div>
                <LegalBlocks blocks={section.blocks} inverted={section.emphasis} />
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
