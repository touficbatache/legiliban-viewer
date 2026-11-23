import type { RecordType } from "@/lib/parliament";

export const TYPE_LABELS: Record<string, string> = {
  front_index: "فهرس رئيسي",
  legislature_landing: "بوابة دور تشريعي",
  session_year_page: "صفحة سنوات",
  deputies_page: "صفحة النواب",
  council_page: "هيئة المجلس",
  government_page: "الحكومات",
  session_list_page: "قائمة جلسات",
  session_transcript: "محضر جلسة",
  error: "سجل خطأ",
  other: "أخرى",
};

export function getTypeLabel(type: RecordType) {
  return TYPE_LABELS[type] ?? type;
}

export function getTypeVariant(
  type: RecordType,
): "default" | "secondary" | "accent" | "burgundy" | "outline" {
  if (type === "session_transcript") return "default";
  if (type === "government_page") return "burgundy";
  if (type === "deputies_page" || type === "council_page") return "secondary";
  if (type === "session_list_page" || type === "session_year_page")
    return "accent";
  return "outline";
}
