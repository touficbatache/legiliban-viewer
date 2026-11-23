import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function JsonInspector({ data }: { data: unknown }) {
  return (
    <section className="surface p-5 md:p-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="json">
          <AccordionTrigger className="text-base">
            البيانات الخام JSON (لأغراض بحثية)
          </AccordionTrigger>
          <AccordionContent>
            <pre className="max-h-[36rem] overflow-auto rounded-2xl border border-border/60 bg-muted/35 p-4 text-xs leading-6 text-foreground/85">
              {JSON.stringify(data, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
