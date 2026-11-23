import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CouncilYear {
  year?: number | null;
  president_ar?: string;
  vice_president_ar?: string;
  secretariat_ar?: string;
}

export function CouncilYears({ years }: { years: CouncilYear[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {years.map((year, index) => (
        <Card
          key={`council-year-${index}`}
          className="border-emerald-300/30 bg-gradient-to-br from-emerald-50/40 via-card to-card"
        >
          <CardContent className="space-y-3 pt-5">
            <Badge variant="secondary">{year.year ?? "غير محدد"}</Badge>
            <p className="text-sm leading-7">
              <span className="font-semibold">الرئيس:</span>{" "}
              {year.president_ar || "-"}
            </p>
            <p className="text-sm leading-7">
              <span className="font-semibold">نائب الرئيس:</span>{" "}
              {year.vice_president_ar || "-"}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              <span className="font-semibold text-foreground">أمانة السر:</span>{" "}
              {year.secretariat_ar || "-"}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
