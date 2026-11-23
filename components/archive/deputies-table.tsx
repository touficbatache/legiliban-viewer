"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeputyRow {
  index?: string;
  name_ar?: string;
  city_ar?: string;
  sect_ar?: string;
  notes_ar?: string;
}

export function DeputiesTable({ rows }: { rows: DeputyRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();

    return rows.filter((row) =>
      [row.name_ar, row.city_ar, row.sect_ar, row.notes_ar]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <section className="surface p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">لائحة النواب</h2>
        <Badge variant="outline">{filtered.length} نتائج</Badge>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ابحث بالاسم، المدينة، المذهب أو الملاحظات"
        className="mb-4"
      />

      <ScrollArea className="max-h-[68vh] rounded-2xl border border-border/60 bg-background/80 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>المذهب</TableHead>
              <TableHead>ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row, index) => (
              <TableRow key={`${row.name_ar}-${index}`}>
                <TableCell>{row.index || index + 1}</TableCell>
                <TableCell className="font-medium">
                  {row.name_ar || "-"}
                </TableCell>
                <TableCell>{row.city_ar || "-"}</TableCell>
                <TableCell>
                  {row.sect_ar ? (
                    <Badge variant="secondary">{row.sect_ar}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.notes_ar || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </section>
  );
}
