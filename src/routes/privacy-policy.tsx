import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/site/LegalDocument";
import { PRIVACY_POLICY } from "@/content/legal";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Babas & Brasse" },
      {
        name: "description",
        content:
          "How Babas & Brasse collects, uses, protects, and manages personal information under POPIA.",
      },
      { property: "og:title", content: "Privacy Policy | Babas & Brasse" },
      {
        property: "og:description",
        content: "Privacy and personal-information practices for the Babas & Brasse platform.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalDocument
      document={PRIVACY_POLICY}
      eyebrow="Legal / Your privacy"
      summary="How personal information is collected, used, secured, retained, and handled across the Babas & Brasse platform."
      documentNumber="02"
    />
  );
}
