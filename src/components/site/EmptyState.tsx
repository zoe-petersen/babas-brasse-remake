export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-2 border-dashed border-border bg-cream/60 px-6 py-16 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
