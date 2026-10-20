import { Button } from "@devmentor/ui/backend/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devmentor/ui/backend/card";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pulpit</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stan systemu</CardTitle>
            <CardDescription>Połączenie z bazą danych sprawdzane przez kontener DI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/api/health">Sprawdź /api/health</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Strona publiczna</CardTitle>
            <CardDescription>Podgląd stron frontendowych.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Otwórz stronę główną</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
