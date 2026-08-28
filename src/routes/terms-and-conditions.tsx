import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/site/LegalDocument";
import { TERMS_AND_CONDITIONS } from "@/content/legal";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | Babas & Brasse" },
      {
        name: "description",
        content:
          "The terms governing access to, contribution to, and use of the Babas & Brasse website.",
      },
      { property: "og:title", content: "Terms and Conditions | Babas & Brasse" },
      {
        property: "og:description",
        content: "Contributor, copyright, editorial, and website terms for Babas & Brasse.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return (
    <LegalDocument
      document={TERMS_AND_CONDITIONS}
      eyebrow="Legal / Website terms"
      summary="The rules that protect our contributors, readers, creative work, and the independent platform that brings them together."
      documentNumber="01"
    />
  );
}
