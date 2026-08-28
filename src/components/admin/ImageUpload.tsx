import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/storage";

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="label-xs">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden border-2 border-ink bg-cream">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="label-xs inline-flex items-center gap-2 border-2 border-ink px-4 py-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="label-xs inline-flex items-center gap-2 border-2 border-destructive px-4 py-2 text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
