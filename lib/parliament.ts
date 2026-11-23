import "server-only";

import { runAll, runGet, type SqlValue } from "@/lib/db";
import { snippetToHtml } from "@/lib/html";

export type KnownRecordType =
  | "front_index"
  | "legislature_landing"
  | "session_year_page"
  | "deputies_page"
  | "council_page"
  | "government_page"
  | "session_list_page"
  | "session_transcript"
  | "error"
  | "other";

export type RecordType = KnownRecordType | string;

export type JsonObject = Record<string, unknown>;

export interface RawPageRow {
  source_url: string;
  type: string;
  title_ar: string | null;
  legislature_code: string | null;
  dod_iso: string | null;
  year?: number | null;
  json: string;
  effective_display_date?: string | null;
  effective_year?: number | null;
}

export interface SearchRow extends RawPageRow {
  snippet?: string | null;
  rank?: number | null;
}

export interface RecordSummary {
  sourceUrl: string;
  type: RecordType;
  titleAr: string | null;
  legislatureCode: string | null;
  dodIso: string | null;
  displayTitle: string;
  displaySubtitle: string | null;
  displayDate: string | null;
  summary: string | null;
  year: number | null;
  hasFullText: boolean;
  snippet?: string | null;
  json: JsonObject;
}

export interface ArchiveStats {
  totalRecords: number;
  transcriptCount: number;
  legislatureCount: number;
  earliestYear: number | null;
  latestYear: number | null;
  byType: Array<{ type: string; count: number }>;
  byYear: Array<{ year: number; count: number }>;
}

export interface SearchParams {
  query?: string;
  type?: string;
  legislature?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  withText?: boolean;
  onlyTranscripts?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: RecordSummary[];
  total: number;
  page: number;
  pageSize: number;
}

function parseJson(value: string): JsonObject {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed ? (parsed as JsonObject) : {};
  } catch {
    return {};
  }
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cast = Number.parseInt(value, 10);
    return Number.isFinite(cast) ? cast : null;
  }
  return null;
}

function toArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function cleanText(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function deriveTitle(row: RawPageRow, json: JsonObject) {
  const candidates: Array<unknown> = [
    json.transcript_heading_ar,
    json.session_heading_ar,
    row.title_ar,
    json.title_ar,
    json.subj_raw,
  ];

  for (const candidate of candidates) {
    const text = cleanText(typeof candidate === "string" ? candidate : null);
    if (text) return text;
  }

  return row.source_url;
}

function deriveSubtitle(row: RawPageRow, json: JsonObject) {
  if (row.type === "session_transcript") {
    return (
      cleanText(typeof json.subj_raw === "string" ? json.subj_raw : null) ||
      cleanText(
        typeof json.held_on_text_ar === "string" ? json.held_on_text_ar : null,
      )
    );
  }

  if (row.type === "deputies_page") {
    const count = toNumber(json.deputy_count);
    return count ? `${count} نائب` : null;
  }

  if (row.type === "government_page") {
    const governments = toArray(json.governments);
    return governments.length ? `${governments.length} حكومات` : null;
  }

  if (row.type === "session_list_page") {
    const sessions = toArray(json.sessions);
    return sessions.length ? `${sessions.length} جلسات` : null;
  }

  if (row.type === "session_year_page") {
    const years = toArray(json.years);
    return years.length ? `${years.length} محطات زمنية` : null;
  }

  return cleanText(
    typeof row.legislature_code === "string" ? row.legislature_code : null,
  );
}

function deriveSummary(row: RawPageRow, json: JsonObject) {
  if (row.type === "session_transcript") {
    return cleanText(
      typeof json.full_text_ar === "string"
        ? json.full_text_ar.slice(0, 280)
        : null,
    );
  }

  if (row.type === "deputies_page") {
    const rows = toArray(json.rows);
    const example = rows.find((item) => {
      if (!item || typeof item !== "object") return false;
      const name = (item as { name_ar?: unknown }).name_ar;
      return typeof name === "string" && name.trim().length > 0;
    }) as { name_ar?: string; city_ar?: string } | undefined;

    if (example?.name_ar) {
      return `يتضمن لائحة النواب، مثال: ${example.name_ar}${example.city_ar ? ` - ${example.city_ar}` : ""}`;
    }

    return "لائحة أعضاء المجلس النيابي";
  }

  if (row.type === "government_page") {
    const governments = toArray<{ header_ar?: string }>(json.governments);
    const firstHeader = cleanText(governments[0]?.header_ar);
    return firstHeader || "تسلسل الحكومات وتشكيلاتها الوزارية";
  }

  if (row.type === "council_page") {
    return "تركيبة هيئة المجلس عبر السنوات";
  }

  if (row.type === "session_list_page") {
    return "فهرس الجلسات ضمن السنة أو العقد المحدد";
  }

  if (row.type === "session_year_page") {
    return "دليل زمني للسنوات وروابط الجلسات";
  }

  const text = cleanText(
    typeof json.text_ar === "string" ? json.text_ar.slice(0, 280) : null,
  );
  return text || null;
}

function deriveYear(row: RawPageRow) {
  const rowYear = toNumber(row.year ?? row.effective_year);
  if (rowYear) return rowYear;

  return null;
}

function hasFullText(row: RawPageRow, json: JsonObject) {
  if (row.type === "session_transcript") {
    const fullText =
      typeof json.full_text_ar === "string" ? json.full_text_ar : "";
    return fullText.trim().length > 0;
  }

  return Boolean(
    cleanText(typeof json.text_ar === "string" ? json.text_ar : null),
  );
}

function deriveDisplayDate(row: RawPageRow, json: JsonObject) {
  const fromRow = cleanText(row.effective_display_date);
  if (fromRow) return fromRow;

  const fromDod = cleanText(row.dod_iso);
  if (fromDod) return fromDod;

  const fromJsonDisplay = cleanText(
    typeof json.displayDate === "string" ? json.displayDate : null,
  );
  if (fromJsonDisplay) return fromJsonDisplay;

  const fromRowYear = toNumber(row.year ?? row.effective_year);
  if (fromRowYear) return String(fromRowYear);

  return null;
}

function mapRecord(row: SearchRow): RecordSummary {
  const json = parseJson(row.json);

  return {
    sourceUrl: row.source_url,
    type: row.type,
    titleAr: row.title_ar,
    legislatureCode: row.legislature_code,
    dodIso: row.dod_iso,
    displayTitle: deriveTitle(row, json),
    displaySubtitle: deriveSubtitle(row, json),
    displayDate: deriveDisplayDate(row, json),
    summary: deriveSummary(row, json),
    year: deriveYear(row),
    hasFullText: hasFullText(row, json),
    snippet: row.snippet ? snippetToHtml(row.snippet) : null,
    json,
  };
}

function getSqlDateCandidate(alias: string) {
  return `COALESCE(NULLIF(TRIM(${alias}.dod_iso), ''), NULLIF(TRIM(json_extract(${alias}.json, '$.displayDate')), ''))`;
}

// The published database (legiliban-crawler) has no year column, so derive it:
// from the session date when there is one, otherwise from the `year` field that
// session list pages carry in their JSON. The type check keeps SQLite from parsing
// the large JSON of every other record.
function getSqlYearExpr(alias: string) {
  return `COALESCE(
    CAST(substr(NULLIF(TRIM(${alias}.dod_iso), ''), 1, 4) AS INTEGER),
    CASE WHEN ${alias}.type = 'session_list_page'
      THEN CAST(json_extract(${alias}.json, '$.year') AS INTEGER) END
  )`;
}

function getSqlDisplayDateExpr(alias: string) {
  const dateCandidate = getSqlDateCandidate(alias);
  const yearExpr = getSqlYearExpr(alias);
  return `COALESCE(${dateCandidate}, CASE WHEN ${yearExpr} IS NOT NULL THEN CAST(${yearExpr} AS TEXT) END)`;
}

function buildFilterSql(params: SearchParams) {
  const clauses: string[] = [];
  const values: SqlValue[] = [];
  const yearExpr = getSqlYearExpr("p");

  if (params.type) {
    clauses.push("p.type = ?");
    values.push(params.type);
  }

  if (params.legislature) {
    clauses.push("p.legislature_code = ?");
    values.push(params.legislature);
  }

  if (params.onlyTranscripts) {
    clauses.push("p.type = 'session_transcript'");
  }

  if (params.startDate) {
    const startYear = Number.parseInt(params.startDate.slice(0, 4), 10);
    if (Number.isFinite(startYear)) {
      clauses.push(`${yearExpr} >= ?`);
      values.push(startYear);
    }
  }

  if (params.endDate) {
    const endYear = Number.parseInt(params.endDate.slice(0, 4), 10);
    if (Number.isFinite(endYear)) {
      clauses.push(`${yearExpr} <= ?`);
      values.push(endYear);
    }
  }

  if (params.year) {
    clauses.push(`${yearExpr} = ?`);
    values.push(params.year);
  }

  return {
    whereSql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
    values,
  };
}

function safePage(value?: number) {
  return value && value > 0 ? value : 1;
}

function safePageSize(value?: number) {
  return Math.min(Math.max(value ?? 24, 1), 60);
}

export function getArchiveStats(): ArchiveStats {
  const yearExpr = getSqlYearExpr("p");

  const totals = runGet<{
    totalRecords: number;
    transcriptCount: number;
    legislatureCount: number;
    earliestYear: number | null;
    latestYear: number | null;
  }>(
    `
    SELECT
      COUNT(*) AS totalRecords,
      SUM(CASE WHEN type = 'session_transcript' THEN 1 ELSE 0 END) AS transcriptCount,
      COUNT(DISTINCT legislature_code) AS legislatureCount,
      MIN(${yearExpr}) AS earliestYear,
      MAX(${yearExpr}) AS latestYear
    FROM pages p
    `,
  );

  const byType = runAll<{ type: string; count: number }>(
    `
    SELECT type, COUNT(*) AS count
    FROM pages
    GROUP BY type
    ORDER BY count DESC
    `,
  );

  const byYear = runAll<{ year: number; count: number }>(
    `
    SELECT ${yearExpr} AS year, COUNT(*) AS count
    FROM pages p
    WHERE ${yearExpr} IS NOT NULL
    GROUP BY year
    ORDER BY year
    `,
  );

  return {
    totalRecords: totals?.totalRecords ?? 0,
    transcriptCount: totals?.transcriptCount ?? 0,
    legislatureCount: totals?.legislatureCount ?? 0,
    earliestYear: totals?.earliestYear ?? null,
    latestYear: totals?.latestYear ?? null,
    byType,
    byYear,
  };
}

export function getAvailableTypes() {
  return runAll<{ type: string }>(
    `
    SELECT DISTINCT type
    FROM pages
    ORDER BY type
    `,
  ).map((row) => row.type);
}

export function getAvailableLegislatures() {
  return runAll<{ legislature_code: string }>(
    `
    SELECT DISTINCT legislature_code
    FROM pages
    WHERE legislature_code IS NOT NULL AND legislature_code <> ''
    ORDER BY legislature_code
    `,
  ).map((row) => row.legislature_code);
}

export function searchRecords(params: SearchParams): SearchResult {
  const query = params.query?.trim();
  const page = safePage(params.page);
  const pageSize = safePageSize(params.pageSize);
  const offset = (page - 1) * pageSize;
  const { whereSql, values } = buildFilterSql(params);
  const displayDateExpr = getSqlDisplayDateExpr("p");
  const yearExpr = getSqlYearExpr("p");

  if (query) {
    try {
      const rows = runAll<SearchRow>(
        `
        SELECT
          p.source_url,
          p.type,
          p.title_ar,
          p.legislature_code,
          p.dod_iso,
          ${displayDateExpr} AS effective_display_date,
          ${yearExpr} AS effective_year,
          '{}' AS json,
          snippet(pf.pages_fts, 3, char(1), char(2), ' ... ', 20) AS snippet,
          bm25(pf.pages_fts) AS rank
        FROM pages_fts pf
        JOIN pages p ON p.source_url = pf.source_url
        WHERE pf.pages_fts MATCH ?
          ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
          ${whereSql}
        ORDER BY rank ASC, effective_year DESC, effective_display_date DESC, p.source_url DESC
        LIMIT ? OFFSET ?
        `,
        [query, ...values, pageSize, offset],
      );

      const totalRow = runGet<{ total: number }>(
        `
        SELECT COUNT(*) AS total
        FROM pages_fts pf
        JOIN pages p ON p.source_url = pf.source_url
        WHERE pf.pages_fts MATCH ?
          ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
          ${whereSql}
        `,
        [query, ...values],
      );

      return {
        items: rows.map(mapRecord),
        total: totalRow?.total ?? 0,
        page,
        pageSize,
      };
    } catch {
      const like = `%${query}%`;
      const rows = runAll<SearchRow>(
        `
        SELECT
          p.source_url,
          p.type,
          p.title_ar,
          p.legislature_code,
          p.dod_iso,
          ${displayDateExpr} AS effective_display_date,
          ${yearExpr} AS effective_year,
          '{}' AS json,
          NULL AS snippet,
          NULL AS rank
        FROM pages p
        ${params.withText ? "JOIN pages_fts pf ON pf.source_url = p.source_url" : ""}
        WHERE (p.title_ar LIKE ? OR p.json LIKE ?)
          ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
          ${whereSql}
        ORDER BY effective_year DESC, effective_display_date DESC, p.source_url DESC
        LIMIT ? OFFSET ?
        `,
        [like, like, ...values, pageSize, offset],
      );

      const totalRow = runGet<{ total: number }>(
        `
        SELECT COUNT(*) AS total
        FROM pages p
        ${params.withText ? "JOIN pages_fts pf ON pf.source_url = p.source_url" : ""}
        WHERE (p.title_ar LIKE ? OR p.json LIKE ?)
          ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
          ${whereSql}
        `,
        [like, like, ...values],
      );

      return {
        items: rows.map(mapRecord),
        total: totalRow?.total ?? 0,
        page,
        pageSize,
      };
    }
  }

  const rows = runAll<SearchRow>(
    `
    SELECT
      p.source_url,
      p.type,
      p.title_ar,
      p.legislature_code,
      p.dod_iso,
      ${displayDateExpr} AS effective_display_date,
      ${yearExpr} AS effective_year,
      '{}' AS json,
      NULL AS snippet,
      NULL AS rank
    FROM pages p
    ${params.withText ? "JOIN pages_fts pf ON pf.source_url = p.source_url" : ""}
    WHERE 1 = 1
      ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
      ${whereSql}
    ORDER BY effective_year DESC, effective_display_date DESC, p.source_url DESC
    LIMIT ? OFFSET ?
    `,
    [...values, pageSize, offset],
  );

  const totalRow = runGet<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM pages p
    ${params.withText ? "JOIN pages_fts pf ON pf.source_url = p.source_url" : ""}
    WHERE 1 = 1
      ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
      ${whereSql}
    `,
    values,
  );

  return {
    items: rows.map(mapRecord),
    total: totalRow?.total ?? 0,
    page,
    pageSize,
  };
}

export function getFacetCounts(params: SearchParams) {
  const query = params.query?.trim();
  const { whereSql, values } = buildFilterSql({
    ...params,
    type: undefined,
    legislature: undefined,
  });

  if (query) {
    try {
      const types = runAll<{ key: string; count: number }>(
        `
        SELECT p.type AS key, COUNT(*) AS count
        FROM pages_fts pf
        JOIN pages p ON p.source_url = pf.source_url
        WHERE pf.pages_fts MATCH ?
          ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
          ${whereSql}
        GROUP BY p.type
        ORDER BY count DESC
        `,
        [query, ...values],
      );

      const legislatures = runAll<{ key: string; count: number }>(
        `
        SELECT p.legislature_code AS key, COUNT(*) AS count
        FROM pages_fts pf
        JOIN pages p ON p.source_url = pf.source_url
        WHERE pf.pages_fts MATCH ?
          ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
          ${whereSql}
          AND p.legislature_code IS NOT NULL
          AND p.legislature_code <> ''
        GROUP BY p.legislature_code
        ORDER BY count DESC
        LIMIT 50
        `,
        [query, ...values],
      );

      return { types, legislatures };
    } catch {
      // Fall through to pages table path.
    }
  }

  const types = runAll<{ key: string; count: number }>(
    `
    SELECT p.type AS key, COUNT(*) AS count
    FROM pages p
    ${params.withText ? "JOIN pages_fts pf ON pf.source_url = p.source_url" : ""}
    WHERE 1 = 1
      ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
      ${whereSql}
    GROUP BY p.type
    ORDER BY count DESC
    `,
    values,
  );

  const legislatures = runAll<{ key: string; count: number }>(
    `
    SELECT p.legislature_code AS key, COUNT(*) AS count
    FROM pages p
    ${params.withText ? "JOIN pages_fts pf ON pf.source_url = p.source_url" : ""}
    WHERE 1 = 1
      ${params.withText ? "AND pf.body_text_ar IS NOT NULL AND pf.body_text_ar <> ''" : ""}
      ${whereSql}
      AND p.legislature_code IS NOT NULL
      AND p.legislature_code <> ''
    GROUP BY p.legislature_code
    ORDER BY count DESC
    LIMIT 50
    `,
    values,
  );

  return { types, legislatures };
}

export function getRecordBySourceUrl(sourceUrl: string) {
  const row = runGet<RawPageRow>(
    `
    SELECT source_url, type, title_ar, legislature_code, dod_iso, json,
      ${getSqlYearExpr("pages")} AS effective_year
    FROM pages
    WHERE source_url = ?
    LIMIT 1
    `,
    [sourceUrl],
  );

  if (!row) return null;
  return mapRecord(row);
}

export function getRelatedRecords(record: RecordSummary, limit = 6) {
  if (!record.legislatureCode && !record.year) return [];

  const yearExpr = getSqlYearExpr("p");
  const displayDateExpr = getSqlDisplayDateExpr("p");

  const clauses: string[] = [];
  const values: SqlValue[] = [];

  if (record.legislatureCode) {
    clauses.push("legislature_code = ?");
    values.push(record.legislatureCode);
  }

  if (record.year) {
    clauses.push(`${yearExpr} = ?`);
    values.push(record.year);
  }

  const rows = runAll<SearchRow>(
    `
    SELECT source_url, type, title_ar, legislature_code, dod_iso, json,
      ${displayDateExpr} AS effective_display_date,
      ${yearExpr} AS effective_year
    FROM pages p
    WHERE p.source_url <> ?
      AND (${clauses.join(" OR ")})
    ORDER BY effective_year DESC, effective_display_date DESC, p.source_url DESC
    LIMIT ?
    `,
    [record.sourceUrl, ...values, limit],
  );

  return rows
    .map(mapRecord)
    .filter((item) => item.sourceUrl !== record.sourceUrl);
}
