"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SourceUrlBlock({ sourceUrl }: { sourceUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(sourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 p-3">
      <div className="mb-2 text-xs text-muted-foreground">الرابط الأصلي</div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <code className="overflow-auto text-xs text-foreground/85">
          {sourceUrl}
        </code>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "تم النسخ" : "نسخ الرابط"}
        </Button>
      </div>
    </div>
  );
}
