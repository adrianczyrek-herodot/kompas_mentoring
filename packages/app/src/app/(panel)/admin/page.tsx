import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import { PageHeader } from "@devmentor/ui/backend/state";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pulpit" };

/** Pulpit admina: stan systemu (health check bazy przez kontener DI) i skróty. */
export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Pulpit" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stan systemu</CardTitle>
            <CardDescription>Połączenie z bazą danych sprawdzane przez kontener DI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/api/health">Sprawdź /api/health</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kolejki moderacji</CardTitle>
            <CardDescription>Zgłoszenia mentorów i spory do rozstrzygnięcia.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild><Link href="/admin/weryfikacja">Weryfikacja mentorów</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/spory">Spory i zwroty</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
