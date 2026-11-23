import { SearchX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-primary/30 bg-gradient-to-br from-card to-primary/5">
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <SearchX className="size-8" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
