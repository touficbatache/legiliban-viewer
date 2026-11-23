import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { CouncilYears } from "@/components/archive/council-years";
import { DeputiesTable } from "@/components/archive/deputies-table";
import { GovernmentsTimeline } from "@/components/archive/governments-timeline";
import { JsonInspector } from "@/components/archive/json-inspector";
import { RecordBadges } from "@/components/archive/record-badges";
import { RecordCard } from "@/components/archive/record-card";
import { SourceUrlBlock } from "@/components/archive/source-url-block";
import { TranscriptReader } from "@/components/archive/transcript-reader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRecordBySourceUrl, getRelatedRecords } from "@/lib/parliament";
import { decodeSourceUrl, encodeSourceUrl } from "@/lib/source-url";

export const dynamic = "force-dynamic";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const sourceUrl = decodeSourceUrl(resolvedParams.id);
  if (!sourceUrl) notFound();

  const record = getRecordBySourceUrl(sourceUrl);
  if (!record) notFound();

  const related = getRelatedRecords(record, 4);

  const json = record.json;
  const transcriptAgenda = asArray<string>(json.index_entries_ar);
  const transcriptPages = asArray<Record<string, unknown>>(json.pages);
  const transcriptPageCount =
    typeof json.page_count === "number"
      ? json.page_count
      : transcriptPages.length > 0
        ? transcriptPages.length
        : undefined;

  const deputiesRows = asArray<Record<string, unknown>>(json.rows).map(
    (row) => ({
      index: typeof row.index === "string" ? row.index : undefined,
      name_ar: typeof row.name_ar === "string" ? row.name_ar : undefined,
      city_ar: typeof row.city_ar === "string" ? row.city_ar : undefined,
      sect_ar: typeof row.sect_ar === "string" ? row.sect_ar : undefined,
      notes_ar: typeof row.notes_ar === "string" ? row.notes_ar : undefined,
    }),
  );

  const governments = asArray<Record<string, unknown>>(json.governments).map(
    (gov) => ({
      government_name_ar:
        typeof gov.government_name_ar === "string"
          ? gov.government_name_ar
          : undefined,
      from: typeof gov.from === "string" ? gov.from : undefined,
      to: typeof gov.to === "string" ? gov.to : undefined,
      header_ar: typeof gov.header_ar === "string" ? gov.header_ar : undefined,
      members: asArray<Record<string, unknown>>(gov.members).map((member) => ({
        index: typeof member.index === "string" ? member.index : undefined,
        name_ar:
          typeof member.name_ar === "string" ? member.name_ar : undefined,
        portfolio_ar:
          typeof member.portfolio_ar === "string"
            ? member.portfolio_ar
            : undefined,
      })),
    }),
  );

  const councilYears = asArray<Record<string, unknown>>(json.years).map(
    (year) => ({
      year: typeof year.year === "number" ? year.year : null,
      president_ar:
        typeof year.president_ar === "string" ? year.president_ar : undefined,
      vice_president_ar:
        typeof year.vice_president_ar === "string"
          ? year.vice_president_ar
          : undefined,
      secretariat_ar:
        typeof year.secretariat_ar === "string"
          ? year.secretariat_ar
          : undefined,
    }),
  );

  const yearRows = asArray<Record<string, unknown>>(json.years);
  const sessionRows = asArray<Record<string, unknown>>(json.sessions);

  return (
    <main className="archive-container flex flex-1 flex-col gap-6 py-6 md:py-10">
      <section className="surface-strong space-y-4 p-6 md:p-8">
        <RecordBadges record={record} />
        <h1 className="max-w-4xl text-2xl font-bold leading-[1.65] tracking-tight md:text-4xl">
          {record.displayTitle}
        </h1>
        {record.displaySubtitle ? (
          <p className="text-sm text-muted-foreground">
            {record.displaySubtitle}
          </p>
        ) : null}
        <SourceUrlBlock sourceUrl={record.sourceUrl} />
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/browse" className="gap-1">
              <ArrowLeft className="size-4" />
              العودة إلى النتائج
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href={record.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="gap-1"
            >
              المصدر الأصلي
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </section>

      {record.type === "session_transcript" ? (
        <TranscriptReader
          transcriptHeading={
            typeof json.transcript_heading_ar === "string"
              ? json.transcript_heading_ar
              : undefined
          }
          sessionHeading={
            typeof json.session_heading_ar === "string"
              ? json.session_heading_ar
              : undefined
          }
          fullText={
            typeof json.full_text_ar === "string"
              ? json.full_text_ar
              : undefined
          }
          agenda={transcriptAgenda}
          pageCount={transcriptPageCount}
        />
      ) : null}

      {record.type === "deputies_page" ? (
        <DeputiesTable rows={deputiesRows} />
      ) : null}

      {record.type === "government_page" ? (
        <GovernmentsTimeline governments={governments} />
      ) : null}

      {record.type === "council_page" ? (
        <CouncilYears years={councilYears} />
      ) : null}

      {(record.type === "session_year_page" ||
        record.type === "session_list_page") && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">سجل السنوات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {yearRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا تتوفر بيانات سنوات.
                </p>
              ) : (
                yearRows.map((row, i) => {
                  const label =
                    typeof row.row_text_ar === "string"
                      ? row.row_text_ar
                      : `سجل ${i + 1}`;
                  const links = asArray<Record<string, unknown>>(row.links);
                  return (
                    <div
                      key={`year-${i}`}
                      className="rounded-xl border border-border/70 bg-background/80 p-3"
                    >
                      <p className="text-sm font-medium">{label}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {links.map((link, idx) => {
                          const url =
                            typeof link.url === "string" ? link.url : "";
                          const labelAr =
                            typeof link.label_ar === "string"
                              ? link.label_ar
                              : "رابط";
                          return url ? (
                            <a
                              key={`${url}-${idx}`}
                              href={`/record/${encodeSourceUrl(url)}`}
                              className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs transition-colors hover:border-primary/40"
                            >
                              {labelAr}
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">قائمة الجلسات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessionRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا تتوفر جلسات ضمن هذا السجل.
                </p>
              ) : (
                sessionRows.slice(0, 150).map((session, i) => {
                  const label =
                    typeof session.label_ar === "string"
                      ? session.label_ar
                      : `جلسة ${i + 1}`;
                  const url =
                    typeof session.url === "string" ? session.url : "";
                  return (
                    <a
                      key={`${url}-${i}`}
                      href={url ? `/record/${encodeSourceUrl(url)}` : "#"}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm transition-colors hover:border-primary/40"
                    >
                      <span>{label}</span>
                      <ArrowLeft className="size-4 text-muted-foreground" />
                    </a>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {record.type !== "session_transcript" &&
      record.type !== "deputies_page" &&
      record.type !== "government_page" &&
      record.type !== "council_page" &&
      record.type !== "session_year_page" &&
      record.type !== "session_list_page" ? (
        <Card>
          <CardHeader>
            <CardTitle>محتوى السجل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
              {typeof json.text_ar === "string"
                ? json.text_ar
                : typeof json.error === "string"
                  ? json.error
                  : "لا يوجد عرض مهيكل لهذا النوع بعد، يمكن الاطلاع على JSON أدناه."}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">سجلات مرتبطة</h2>
        {related.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لا توجد سجلات مرتبطة كفاية ضمن نفس الدور أو السنة.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((item) => (
              <RecordCard key={item.sourceUrl} record={item} />
            ))}
          </div>
        )}
      </section>

      <JsonInspector data={record.json} />
    </main>
  );
}
