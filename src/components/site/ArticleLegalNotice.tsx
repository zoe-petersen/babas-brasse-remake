const MAGAZINE_CONTACT_EMAIL = "submissions@babasandbrasse.co.za";

export function ArticleLegalNotice({
  authorName,
  publishedAt,
  contactEmail,
}: {
  authorName: string;
  publishedAt: string | null;
  contactEmail?: string | null;
}) {
  const publishedYear = publishedAt ? new Date(publishedAt).getUTCFullYear() : NaN;
  const year = Number.isFinite(publishedYear) ? publishedYear : new Date().getFullYear();
  const email = contactEmail || MAGAZINE_CONTACT_EMAIL;

  return (
    <aside aria-label="Copyright and contributor disclaimer" className="mt-10 border-2 border-ink">
      <div className="bg-cream p-5 sm:p-6">
        <p className="label-xs text-forest-deep">Copyright notice</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          &copy; {year} {authorName}. Published by Babas and Brasse. All rights reserved except as
          permitted by law. The author retains copyright unless otherwise stated. Unauthorised
          reproduction, republication or substantial adaptation of this work is prohibited. For
          permissions or copyright concerns, contact{" "}
          <a className="font-semibold text-foreground underline" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
      </div>
      <div className="border-t-2 border-ink bg-background p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Contributor Disclaimer:</strong> Views expressed in
          this article are those of the contributor and do not necessarily represent the views of
          Babas and Brasse, its editors, directors or team. Publication does not constitute
          endorsement.
        </p>
      </div>
    </aside>
  );
}
