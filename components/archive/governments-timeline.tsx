import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GovernmentMember {
  index?: string;
  name_ar?: string;
  portfolio_ar?: string;
}

interface GovernmentBlock {
  government_name_ar?: string;
  from?: string;
  to?: string;
  header_ar?: string;
  members?: GovernmentMember[];
}

export function GovernmentsTimeline({
  governments,
}: {
  governments: GovernmentBlock[];
}) {
  return (
    <section className="space-y-4">
      {governments.map((gov, index) => (
        <Card
          key={`gov-${index}`}
          className="border-burgundy-200/40 bg-gradient-to-br from-rose-50/60 via-card to-card"
        >
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="burgundy">حكومة {index + 1}</Badge>
              {gov.from ? <Badge variant="outline">من {gov.from}</Badge> : null}
              {gov.to ? <Badge variant="outline">إلى {gov.to}</Badge> : null}
            </div>
            <CardTitle className="text-lg">
              {gov.government_name_ar || gov.header_ar || "تشكيلة حكومية"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الحقيبة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(gov.members || []).map((member, i) => (
                  <TableRow key={`${member.name_ar}-${i}`}>
                    <TableCell>{member.index || i + 1}</TableCell>
                    <TableCell className="font-medium">
                      {member.name_ar || "-"}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap text-muted-foreground">
                      {member.portfolio_ar || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
