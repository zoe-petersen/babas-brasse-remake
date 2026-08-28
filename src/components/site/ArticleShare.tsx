import { useState } from "react";
import { Facebook, Link as LinkIcon, Linkedin, Mail, MessageCircle, Share2, X } from "lucide-react";
import { toast } from "sonner";

type ShareLink = {
  label: string;
  href: string;
  Icon: typeof Facebook;
};

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

export function ArticleShare({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  const [sharing, setSharing] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const shareTitle = `${title} — Babas & Brasse`;
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedMessage = encodeURIComponent(`${shareTitle}\n${url}`);

  const shareLinks: ShareLink[] = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      Icon: X,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedMessage}`,
      Icon: MessageCircle,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
      Icon: Mail,
    },
  ];

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else if (!fallbackCopy(url)) throw new Error("Copy failed");
      toast.success("Article link copied");
    } catch {
      toast.error("Could not copy the link. Please copy it from your address bar.");
    }
  };

  const openNativeShare = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    setSharing(true);
    try {
      await navigator.share({ title: shareTitle, text: description, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("This device could not open the share menu.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <section
      aria-label="Share this piece"
      className="mt-8 flex flex-col gap-4 border-y-2 border-ink bg-cream px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="label-xs text-forest-deep">Share this piece</p>
        <p className="mt-1 text-sm text-muted-foreground">Pass the story on to your people.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void openNativeShare()}
          disabled={sharing}
          className="label-xs inline-flex h-10 items-center gap-2 border-2 border-ink bg-magenta px-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        {shareLinks.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={label === "Email" ? undefined : "_blank"}
            rel={label === "Email" ? undefined : "noopener noreferrer"}
            aria-label={`Share on ${label}`}
            title={`Share on ${label}`}
            className="grid h-10 w-10 place-items-center border-2 border-ink bg-background transition-colors hover:bg-forest"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
        <button
          type="button"
          onClick={() => void copyLink()}
          aria-label="Copy article link"
          title="Copy article link"
          className="grid h-10 w-10 place-items-center border-2 border-ink bg-background transition-colors hover:bg-forest"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
