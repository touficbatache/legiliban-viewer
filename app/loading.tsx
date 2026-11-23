import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="archive-container flex flex-1 flex-col gap-6 py-8">
      <Skeleton className="h-56 rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-72" />
    </main>
  );
}
