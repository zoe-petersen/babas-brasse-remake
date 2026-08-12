import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export const Route = createFileRoute("/dev-editor-check")({ component: Page });

function Page() {
  const [v, setV] = useState(
    '<p>Hello</p><img class="article-inline-image" src="/api/public/media/articles/body/3c117db4-eb6a-4859-be0e-5ab80955fc9a.jpg" alt="" title="A caption"><p>After</p>',
  );
  return <div className="p-8"><RichTextEditor value={v} onChange={setV} /></div>;
}
