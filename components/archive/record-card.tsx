import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordBadges } from "@/components/archive/record-badges";
import type { RecordSummary } from "@/lib/parliament";
import { encodeSourceUrl } from "@/lib/source-url";

export function RecordCard({
  record,
  query,
}: {
  record: RecordSummary;
  query?: string;
}) {
  return (
    <Card className="group border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-50px_rgba(37,99,235,0.55)]">
      <CardHeader className="space-y-3 pb-3">
        <RecordBadges record={record} />
        <CardTitle className="line-clamp-2 leading-8">
          {record.displayTitle}
        </CardTitle>
        {record.displaySubtitle ? (
          <p className="text-sm text-muted-foreground">
            {record.displaySubtitle}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {record.snippet ? (
          <p
            className="line-clamp-3 text-sm leading-7 text-foreground/90 [&_mark]:rounded-md [&_mark]:bg-amber-200/70 [&_mark]:px-1"
            dangerouslySetInnerHTML={{ __html: record.snippet }}
          />
        ) : record.summary ? (
          <p className="line-clamp-3 text-sm leading-7 text-foreground/85">
            {record.summary}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            لا يوجد ملخص متاح لهذا السجل.
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="truncate text-xs text-muted-foreground">
            {record.sourceUrl}
          </span>
          <Link
            href={`/record/${encodeSourceUrl(record.sourceUrl)}${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            عرض السجل
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
