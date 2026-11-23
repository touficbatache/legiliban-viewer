import { NextResponse } from "next/server";

import {
  getAvailableLegislatures,
  getAvailableTypes,
  getFacetCounts,
  searchRecords,
  type SearchParams,
} from "@/lib/parliament";

function parseBool(value: string | null) {
  return value === "1" || value === "true";
}

function parseIntOrUndefined(value: string | null) {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params: SearchParams = {
    query: searchParams.get("q")?.trim() || undefined,
    type: searchParams.get("type") || undefined,
    legislature: searchParams.get("legislature") || undefined,
    startDate: searchParams.get("start") || undefined,
    endDate: searchParams.get("end") || undefined,
    year: parseIntOrUndefined(searchParams.get("year")),
    withText: parseBool(searchParams.get("fullText")),
    onlyTranscripts: parseBool(searchParams.get("onlyTranscripts")),
    page: parseIntOrUndefined(searchParams.get("page")) ?? 1,
    pageSize: 24,
  };

  const [results, facets, types, legislatures] = [
    searchRecords(params),
    getFacetCounts(params),
    getAvailableTypes(),
    getAvailableLegislatures(),
  ];

  return NextResponse.json({
    results,
    facets,
    types,
    legislatures,
  });
}
