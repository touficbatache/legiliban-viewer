import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecordNotFound() {
  return (
    <main className="archive-container flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-xl text-center">
        <CardHeader>
          <CardTitle>السجل غير موجود</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            لم نتمكن من العثور على السجل المطلوب. قد يكون الرابط غير صالح أو غير
            مفهرس بعد.
          </p>
          <Button asChild>
            <Link href="/browse">العودة إلى المتصفح</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
