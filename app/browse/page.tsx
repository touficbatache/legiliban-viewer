"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";

import { EmptyState } from "@/components/archive/empty-state";
import { RecordCard } from "@/components/archive/record-card";
import { SearchControls } from "@/components/archive/search-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecordSummary } from "@/lib/parliament";
import { getTypeLabel } from "@/lib/parliament-labels";

interface SearchResult {
  items: RecordSummary[];
  total: number;
  page: number;
  pageSize: number;
}

interface Facets {
  types: Array<{ key: string; count: number }>;
  legislatures: Array<{ key: string; count: number }>;
}

interface ApiPayload {
  results: SearchResult;
  facets: Facets;
  types: string[];
  legislatures: string[];
}

const EMPTY_RESULTS: SearchResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 24,
};

const EMPTY_FACETS: Facets = {
  types: [],
  legislatures: [],
};

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULTS);
  const [facets, setFacets] = useState<Facets>(EMPTY_FACETS);
  const [types, setTypes] = useState<string[]>([]);
  const [legislatures, setLegislatures] = useState<string[]>([]);

  const qs = useMemo(() => {
    const next = new URLSearchParams(searchParams.toString());
    return next;
  }, [searchParams]);

  const params = useMemo(
    () => ({
      query: qs.get("q") || undefined,
      type: qs.get("type") || undefined,
      legislature: qs.get("legislature") || undefined,
      startDate: qs.get("start") || undefined,
      endDate: qs.get("end") || undefined,
      year: qs.get("year")
        ? Number.parseInt(qs.get("year") as string, 10)
        : undefined,
      withText: qs.get("fullText") === "1",
      onlyTranscripts: qs.get("onlyTranscripts") === "1",
    }),
    [qs],
  );

  const buildBrowseHref = (
    updates: Record<string, string | number | null | undefined>,
  ) => {
    const next = new URLSearchParams(qs.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }

    const search = next.toString();
    return search ? `/browse?${search}` : "/browse";
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/archive/search?${qs.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => response.json() as Promise<ApiPayload>)
      .then((payload) => {
        setResults(payload.results || EMPTY_RESULTS);
        setFacets(payload.facets || EMPTY_FACETS);
        setTypes(payload.types || []);
        setLegislatures(payload.legislatures || []);
      })
      .catch((error: unknown) => {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        setResults(EMPTY_RESULTS);
        setFacets(EMPTY_FACETS);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [qs]);

  const totalPages = Math.max(Math.ceil(results.total / results.pageSize), 1);

  return (
    <main className="archive-container flex flex-1 flex-col gap-6 py-6 md:py-10">
      <section className="surface-strong p-6">
        <h1 className="archive-heading">متصفح الأرشيف</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          بحث نصي عربي، مرشحات تفاعلية، وروابط قابلة للمشاركة للاستكشاف والتحقيق
          التاريخي.
        </p>
      </section>

      <SearchControls types={types} legislatures={legislatures} />

      <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-3 p-4 md:p-5">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {results.total.toLocaleString("en-US")}
              </span>{" "}
              نتيجة
            </p>
            <div className="flex flex-wrap gap-2">
              {params.query ? (
                <Badge variant="outline">{params.query}</Badge>
              ) : null}
              {params.type ? (
                <Badge variant="outline">{getTypeLabel(params.type)}</Badge>
              ) : null}
              {params.legislature ? (
                <Badge variant="outline">{params.legislature}</Badge>
              ) : null}
              {params.year ? (
                <Badge variant="outline">{params.year}</Badge>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-3xl" />
              ))}
            </div>
          ) : null}

          {!loading && results.items.length === 0 ? (
            <EmptyState
              title="لا توجد نتائج مطابقة"
              description="جرّب تخفيف المرشحات أو استخدم كلمات بحث مختلفة للوصول إلى السجلات المطلوبة."
            />
          ) : null}

          {!loading && results.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {results.items.map((record) => (
                <RecordCard
                  key={record.sourceUrl}
                  record={record}
                  query={params.query}
                />
              ))}
            </div>
          ) : null}

          <div className="surface flex items-center justify-between gap-3 p-4">
            <Button asChild variant="outline" disabled={results.page <= 1}>
              <Link href={buildBrowseHref({ page: results.page - 1 })}>
                الصفحة السابقة
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              صفحة {results.page} من {totalPages}
            </span>
            <Button
              asChild
              variant="outline"
              disabled={results.page >= totalPages}
            >
              <Link href={buildBrowseHref({ page: results.page + 1 })}>
                الصفحة التالية
              </Link>
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
                <Filter className="size-4 text-primary" />
                أبرز الأنواع
              </h2>
              <div className="space-y-2">
                {facets.types.slice(0, 8).map((item) => (
                  <Link
                    key={item.key}
                    href={buildBrowseHref({ type: item.key, page: 1 })}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm transition-colors hover:border-primary/40"
                  >
                    <span>{getTypeLabel(item.key)}</span>
                    <span className="font-medium">{item.count}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 text-sm font-semibold">الأدوار التشريعية</h2>
              <div className="space-y-2">
                {facets.legislatures.slice(0, 10).map((item) => (
                  <Link
                    key={item.key}
                    href={buildBrowseHref({ legislature: item.key, page: 1 })}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm transition-colors hover:border-primary/40"
                  >
                    <span>{item.key}</span>
                    <span className="font-medium">{item.count}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="ghost" className="w-full justify-between">
            <Link href="/">
              العودة للواجهة الرئيسية
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </aside>
      </section>
    </main>
  );
}
