"use client";

import { useMemo, useState } from "react";
import { BookOpenText, ListTree, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { escapeHtml } from "@/lib/html";

interface TranscriptReaderProps {
  transcriptHeading?: string;
  sessionHeading?: string;
  fullText?: string;
  agenda?: string[];
  pageCount?: number;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TranscriptReader({
  transcriptHeading,
  sessionHeading,
  fullText,
  agenda,
  pageCount,
}: TranscriptReaderProps) {
  const [withinQuery, setWithinQuery] = useState("");

  const highlighted = useMemo(() => {
    // Escape the crawled text first, then highlight within the escaped string.
    const source = escapeHtml((fullText || "").trim());
    if (!withinQuery.trim()) return source;

    try {
      const regex = new RegExp(escapeRegExp(escapeHtml(withinQuery.trim())), "gi");
      return source.replace(regex, (match) => `<mark>${match}</mark>`);
    } catch {
      return source;
    }
  }, [fullText, withinQuery]);

  return (
    <div className="surface space-y-6 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold leading-9">
            {transcriptHeading || sessionHeading || "محضر جلسة"}
          </h2>
          <p className="text-sm text-muted-foreground">
            قراءة مريحة مع البحث داخل النص وتبديل العرض.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pageCount ? (
            <Badge variant="outline">{pageCount} صفحات</Badge>
          ) : null}
          {agenda && agenda.length > 0 ? (
            <Badge variant="accent">{agenda.length} بنود فهرس</Badge>
          ) : null}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          بحث داخل المحضر
        </span>
        <Input
          value={withinQuery}
          onChange={(event) => setWithinQuery(event.target.value)}
          placeholder="ابحث عن كلمة داخل النص الحالي"
        />
      </label>

      <Tabs defaultValue="reading">
        <TabsList>
          <TabsTrigger value="reading" className="gap-1">
            <BookOpenText className="size-4" />
            عرض القراءة
          </TabsTrigger>
          <TabsTrigger value="structured" className="gap-1">
            <ListTree className="size-4" />
            عرض هيكلي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reading">
          <ScrollArea className="h-[65vh] rounded-2xl border border-border/60 bg-background/80 p-5">
            <article
              className="mx-auto max-w-3xl whitespace-pre-wrap text-right text-[1.04rem] leading-9 text-foreground/95 [&_mark]:rounded-md [&_mark]:bg-amber-200/80 [&_mark]:px-1"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="structured" className="space-y-4">
          {agenda && agenda.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <h3 className="mb-2 text-sm font-semibold">فهرس البنود</h3>
              <ul className="space-y-2 text-sm text-foreground/85">
                {agenda.map((entry, index) => (
                  <li
                    key={`${entry}-${index}`}
                    className="rounded-lg bg-muted/35 px-3 py-2"
                  >
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <h3 className="mb-2 text-sm font-semibold">النص الكامل</h3>
            <p className="max-h-[52vh] overflow-auto whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
              {fullText || "لا يوجد نص متاح."}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
