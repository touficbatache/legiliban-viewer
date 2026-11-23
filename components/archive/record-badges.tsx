import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getTypeLabel, getTypeVariant } from "@/lib/parliament-labels";
import type { RecordSummary } from "@/lib/parliament";

export function RecordBadges({ record }: { record: RecordSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge variant={getTypeVariant(record.type)}>
        {getTypeLabel(record.type)}
      </Badge>
      {/* {record.legislatureCode ? (
        <Badge variant="outline">{record.legislatureCode}</Badge>
      ) : null} */}
      {record.displayDate ? (
        <Badge variant="outline" className="gap-1">
          <CalendarDays className="size-3" />
          {record.displayDate}
        </Badge>
      ) : null}
      {record.year ? <Badge variant="outline">{record.year}</Badge> : null}
    </div>
  );
}
