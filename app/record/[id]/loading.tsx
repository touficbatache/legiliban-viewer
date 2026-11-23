import { Skeleton } from "@/components/ui/skeleton";

export default function RecordLoading() {
  return (
    <main className="archive-container flex flex-1 flex-col gap-6 py-8">
      <Skeleton className="h-56 rounded-3xl" />
      <Skeleton className="h-[55vh] rounded-3xl" />
      <Skeleton className="h-72 rounded-3xl" />
    </main>
  );
}
