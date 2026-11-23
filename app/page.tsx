import Link from "next/link";
import { ArrowLeft, Clock3, Database, Landmark, Search } from "lucide-react";

import { RecordBadges } from "@/components/archive/record-badges";
import { StatCard } from "@/components/archive/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { encodeSourceUrl } from "@/lib/source-url";
import { getArchiveStats, searchRecords } from "@/lib/parliament";

export const dynamic = "force-dynamic";

export default function Home() {
  // Debug mode: disable DB reads to isolate loading issues.
  const stats = getArchiveStats();
  const latest = searchRecords({
    page: 1,
    pageSize: 6,
    onlyTranscripts: true,
  }).items;
  const featured = searchRecords({
    page: 1,
    pageSize: 4,
    withText: true,
  }).items;

  // const stats = {
  //   totalRecords: 4952,
  //   transcriptCount: 2311,
  //   legislatureCount: 315,
  //   earliestYear: 1920,
  //   latestYear: 2020,
  //   byType: [
  //     { type: "other", count: 2318 },
  //     { type: "session_transcript", count: 2311 },
  //     { type: "session_list_page", count: 202 },
  //     { type: "session_year_page", count: 43 },
  //     { type: "deputies_page", count: 25 },
  //     { type: "council_page", count: 24 },
  //     { type: "government_page", count: 21 },
  //   ],
  //   byYear: [
  //     { year: 1922, count: 16 },
  //     { year: 1926, count: 42 },
  //     { year: 1930, count: 50 },
  //     { year: 1943, count: 87 },
  //     { year: 1952, count: 102 },
  //     { year: 1968, count: 120 },
  //     { year: 1992, count: 136 },
  //     { year: 2005, count: 111 },
  //     { year: 2018, count: 95 },
  //     { year: 2020, count: 64 },
  //   ],
  // };

  // const latest = [
  //   {
  //     sourceUrl: "http://77.42.251.205/parliament/P0/1922/P22N11/000.HTM",
  //     type: "session_transcript",
  //     titleAr: null,
  //     legislatureCode: "R1",
  //     dodIso: "1922-05-25",
  //     displayTitle: "المجلس النيابي - محضر الجلسة الأولى",
  //     displaySubtitle: "المجلس التمثيلي الاول",
  //     displayDate: "1922-05-25",
  //     summary: "نص تجريبي لعرض السجلات دون تحميل قاعدة البيانات.",
  //     year: 1922,
  //     hasFullText: true,
  //     snippet: null,
  //     json: {},
  //   },
  //   {
  //     sourceUrl: "http://77.42.251.205/parliament/P0/1922/P22N12/000.HTM",
  //     type: "session_transcript",
  //     titleAr: null,
  //     legislatureCode: "R1",
  //     dodIso: "1922-05-30",
  //     displayTitle: "المجلس النيابي - محضر الجلسة الثانية",
  //     displaySubtitle: "المجلس التمثيلي الاول",
  //     displayDate: "1922-05-30",
  //     summary: "مثال ثانٍ للتأكد أن الصفحة لا تعتمد على DB أثناء التشخيص.",
  //     year: 1922,
  //     hasFullText: true,
  //     snippet: null,
  //     json: {},
  //   },
  // ];

  // const featured = [
  //   {
  //     sourceUrl: "http://77.42.251.205/parliament/explore/DEPUTE/R1.HTM",
  //     type: "deputies_page",
  //     titleAr: "المجلس التمثيلي الاول",
  //     legislatureCode: "R1",
  //     dodIso: null,
  //     displayTitle: "صفحة النواب - المجلس التمثيلي الاول",
  //     displaySubtitle: "30 نائب",
  //     displayDate: null,
  //     summary: "سجل تجريبي",
  //     year: 1922,
  //     hasFullText: false,
  //     snippet: null,
  //     json: {},
  //   },
  //   {
  //     sourceUrl: "http://77.42.251.205/parliament/GOUVERNEMENT/01.HTM",
  //     type: "government_page",
  //     titleAr: "الدور التشريعي الاول",
  //     legislatureCode: "01",
  //     dodIso: null,
  //     displayTitle: "الحكومات - الدور التشريعي الاول",
  //     displaySubtitle: "تسلسل الحكومات",
  //     displayDate: null,
  //     summary: "سجل تجريبي",
  //     year: 1927,
  //     hasFullText: false,
  //     snippet: null,
  //     json: {},
  //   },
  // ];

  const maxByYear = Math.max(...stats.byYear.map((point) => point.count), 1);

  return (
    <main className="archive-container flex flex-1 flex-col gap-8 py-6 md:py-10">
      <section className="surface-strong relative overflow-hidden p-6 md:p-10">
        <div className="absolute -left-12 -top-10 size-44 rounded-full bg-chart-2/20 blur-3xl" />
        <div className="absolute -bottom-10 right-0 size-52 rounded-full bg-chart-3/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Landmark className="size-3.5" />
              منصة الأرشيف البرلماني اللبناني
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-[1.45] tracking-tight text-foreground md:text-5xl">
              بوابة بحث واستكشاف تاريخية لمحاضر الجلسات والحياة البرلمانية
              اللبنانية
            </h1>
            <p className="max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">
              متصفح غني للبحث في نصوص الجلسات، واستعراض النواب والحكومات وهيئة
              المجلس، مع واجهة عربية مصممة للباحثين والصحفيين والمؤرخين.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-11 px-5">
                <Link href="/browse" className="gap-2">
                  ابدأ التصفح
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-5">
                <Link href="/browse?onlyTranscripts=1">عرض محاضر الجلسات</Link>
              </Button>
            </div>
          </div>

          <Card className="border-primary/20 bg-background/80">
            <CardHeader>
              <CardTitle className="text-base">البحث السريع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/browse?q=المجلس"
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span className="inline-flex items-center gap-2">
                  <Search className="size-4 text-primary" />
                  البحث عن &quot;المجلس&quot;
                </span>
                <ArrowLeft className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/browse?type=deputies_page"
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span>استكشاف صفحات النواب</span>
                <ArrowLeft className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/browse?type=government_page"
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span>استكشاف الحكومات</span>
                <ArrowLeft className="size-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="إجمالي السجلات"
          value={stats.totalRecords.toLocaleString("en-US")}
        />
        <StatCard
          title="محاضر الجلسات"
          value={stats.transcriptCount.toLocaleString("en-US")}
        />
        <StatCard
          title="الأدوار التشريعية"
          value={stats.legislatureCount.toLocaleString("en-US")}
        />
        <StatCard
          title="المدى الزمني"
          value={`${stats.earliestYear ?? "-"} - ${stats.latestYear ?? "-"}`}
          subtitle="حسب الحقول المتاحة"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl">توزيع السجلات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.byType.slice(0, 9).map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.type}</span>
                  <span className="font-semibold">
                    {item.count.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-primary to-chart-2"
                    style={{
                      width: `${Math.min((item.count / stats.totalRecords) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-chart-3/20">
          <CardHeader>
            <CardTitle className="text-xl">لمحة زمنية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-7 items-end gap-2">
              {stats.byYear.slice(-21).map((point) => (
                <div
                  key={point.year}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-chart-3/80 to-chart-1/65"
                    style={{
                      height: `${Math.max((point.count / maxByYear) * 132, 8)}px`,
                    }}
                    title={`${point.year}: ${point.count}`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {point.year}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              أحدث 21 نقطة زمنية بحسب تاريخ السجل.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "جلسات",
            subtitle: "محاضر الجلسات والتفريغ النصي",
            href: "/browse?onlyTranscripts=1",
          },
          {
            title: "النواب",
            subtitle: "أسماء النواب وتوزعهم",
            href: "/browse?type=deputies_page",
          },
          {
            title: "الحكومات",
            subtitle: "التشكيلات الوزارية",
            href: "/browse?type=government_page",
          },
          {
            title: "هيئة المجلس",
            subtitle: "الرئاسة وأمانة السر",
            href: "/browse?type=council_page",
          },
        ].map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="surface group p-5 transition-colors hover:border-primary/35"
          >
            <h3 className="text-lg font-semibold">{entry.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {entry.subtitle}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              استعرض
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-xl">
              <Clock3 className="size-5 text-primary" />
              أحدث محاضر الجلسات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latest.map((record) => (
              <Link
                key={record.sourceUrl}
                href={`/record/${encodeSourceUrl(record.sourceUrl)}`}
                className="block rounded-2xl border border-border/70 bg-background/70 p-3 transition-colors hover:border-primary/35"
              >
                <RecordBadges record={record} />
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-7">
                  {record.displayTitle}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-xl">
              <Database className="size-5 text-primary" />
              سجلات بارزة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featured.map((record) => (
              <Link
                key={record.sourceUrl}
                href={`/record/${encodeSourceUrl(record.sourceUrl)}`}
                className="block rounded-2xl border border-border/70 bg-background/70 p-3 transition-colors hover:border-primary/35"
              >
                <RecordBadges record={record} />
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-7">
                  {record.displayTitle}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
