"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";

import { decodeSourceUrl } from "@/lib/source-url";

function getSegmentLabel(segment: string) {
  if (segment === "browse") return "المتصفح";
  if (segment === "record") return "السجل";
  return decodeURIComponent(segment);
}

function formatIdValue(value: string) {
  const decoded = decodeSourceUrl(value);
  if (!decoded) return decodeURIComponent(value);

  try {
    const parsed = new URL(decoded);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return decoded;
  }
}

export function GlobalBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav className="archive-container pt-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-foreground">
          <Home className="size-4" />
          الرئيسية
        </span>
      </nav>
    );
  }

  return (
    <nav className="archive-container flex flex-wrap items-center gap-2 pt-4 text-sm text-muted-foreground">
      <Link
        href="/"
        className="inline-flex items-center gap-1 transition-colors hover:text-primary"
      >
        <Home className="size-4" />
        الرئيسية
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const previous = index > 0 ? segments[index - 1] : null;
        const isRecordId = previous === "record";
        const label = isRecordId
          ? formatIdValue(segment)
          : getSegmentLabel(segment);

        if (isLast) {
          return (
            <span
              key={href}
              className="flex items-center gap-2 text-foreground"
            >
              <span>/</span>
              <span className="max-w-[24rem] truncate" title={label}>
                {label}
              </span>
            </span>
          );
        }

        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>
            <Link href={href} className="transition-colors hover:text-primary">
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
