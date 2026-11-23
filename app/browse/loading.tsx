import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <main className="archive-container flex flex-1 flex-col gap-5 py-8">
      <Skeleton className="h-28 rounded-3xl" />
      <Skeleton className="h-52 rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-56 rounded-3xl" />
        ))}
      </div>
    </main>
  );
}
