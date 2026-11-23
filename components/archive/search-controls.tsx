"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTypeLabel } from "@/lib/parliament-labels";

interface SearchControlsProps {
  types: string[];
  legislatures: string[];
}

function updateParams(
  source: URLSearchParams,
  key: string,
  value: string | boolean,
  routerPush: (url: string) => void,
  pathname: string,
) {
  const next = new URLSearchParams(source.toString());

  if (
    value === "" ||
    value === false ||
    value === "all" ||
    value === "0" ||
    value === "false"
  ) {
    next.delete(key);
  } else {
    next.set(key, String(value));
  }

  next.delete("page");
  const qs = next.toString();
  routerPush(qs ? `${pathname}?${qs}` : pathname);
}

export function SearchControls({ types, legislatures }: SearchControlsProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(params.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      if (query !== (params.get("q") ?? "")) {
        startTransition(() => {
          updateParams(params, "q", query.trim(), router.push, pathname);
        });
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [query, params, pathname, router]);

  const activeCount = useMemo(() => {
    let count = 0;
    [
      "q",
      "type",
      "legislature",
      "start",
      "end",
      "year",
      "fullText",
      "onlyTranscripts",
    ].forEach((key) => {
      if (params.get(key)) count += 1;
    });
    return count;
  }, [params]);

  return (
    <section className="surface p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="xl:col-span-2">
          <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Search className="size-3.5" />
            البحث النصي
          </span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث في محاضر الجلسات والمحتوى العربي..."
            className="h-11"
          />
        </label>

        <label>
          <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            النوع
          </span>
          <select
            value={params.get("type") ?? "all"}
            onChange={(event) =>
              startTransition(() =>
                updateParams(
                  params,
                  "type",
                  event.target.value,
                  router.push,
                  pathname,
                ),
              )
            }
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3 text-sm"
          >
            <option value="all">كل الأنواع</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            الدور التشريعي
          </span>
          <select
            value={params.get("legislature") ?? "all"}
            onChange={(event) =>
              startTransition(() =>
                updateParams(
                  params,
                  "legislature",
                  event.target.value,
                  router.push,
                  pathname,
                ),
              )
            }
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3 text-sm"
          >
            <option value="all">كل الأدوار</option>
            {legislatures.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            من تاريخ
          </span>
          <Input
            type="date"
            value={params.get("start") ?? ""}
            onChange={(event) =>
              startTransition(() =>
                updateParams(
                  params,
                  "start",
                  event.target.value,
                  router.push,
                  pathname,
                ),
              )
            }
            className="h-11"
          />
        </label>

        <label>
          <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            إلى تاريخ
          </span>
          <Input
            type="date"
            value={params.get("end") ?? ""}
            onChange={(event) =>
              startTransition(() =>
                updateParams(
                  params,
                  "end",
                  event.target.value,
                  router.push,
                  pathname,
                ),
              )
            }
            className="h-11"
          />
        </label>

        <label>
          <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            السنة
          </span>
          <Input
            inputMode="numeric"
            value={params.get("year") ?? ""}
            onChange={(event) =>
              startTransition(() =>
                updateParams(
                  params,
                  "year",
                  event.target.value,
                  router.push,
                  pathname,
                ),
              )
            }
            placeholder="مثال: 1952"
            className="h-11"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            startTransition(() =>
              updateParams(
                params,
                "fullText",
                !(params.get("fullText") === "1"),
                router.push,
                pathname,
              ),
            )
          }
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            params.get("fullText") === "1"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          فقط السجلات ذات النص
        </button>

        <button
          type="button"
          onClick={() =>
            startTransition(() =>
              updateParams(
                params,
                "onlyTranscripts",
                !(params.get("onlyTranscripts") === "1"),
                router.push,
                pathname,
              ),
            )
          }
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            params.get("onlyTranscripts") === "1"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          محاضر الجلسات فقط
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => router.push(pathname))}
          className="gap-1"
          disabled={activeCount === 0 || isPending}
        >
          <RotateCcw className="size-3.5" />
          إعادة ضبط المرشحات
        </Button>

        <span className="text-xs text-muted-foreground">
          {activeCount} مرشحات نشطة
        </span>
      </div>
    </section>
  );
}
