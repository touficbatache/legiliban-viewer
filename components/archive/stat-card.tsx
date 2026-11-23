import { Landmark } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute -left-8 top-0 size-24 rounded-full bg-chart-4/20 blur-2xl" />
      </div>
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center justify-between">
          <Landmark className="size-4 text-primary/70" />
        </div>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
