import { CircleAlertIcon, InboxIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

function StateBox({ icon, title, text, children, tone = "muted", role }: {
  icon: ReactNode; title: string; text: string; children?: ReactNode; tone?: "muted" | "destructive"; role?: "alert";
}) {
  return (
    <div role={role} className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
      <div className={cn("flex size-10 items-center justify-center rounded-full", tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

/** Stan „empty” w panelu. */
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <StateBox icon={<InboxIcon className="size-5" />} title={title} text={text}>{action}</StateBox>;
}

/** Stan „error” w panelu z przyciskiem ponowienia. */
export function ErrorState({ text = "Nie udało się wczytać danych.", onRetry }: { text?: string; onRetry?: () => void }) {
  return (
    <StateBox icon={<CircleAlertIcon className="size-5" />} title="Coś poszło nie tak" text={text} tone="destructive" role="alert">
      {onRetry && <Button variant="outline" onClick={onRetry}>Spróbuj ponownie</Button>}
    </StateBox>
  );
}

/** Nagłówek strony panelu: tytuł, opcjonalny nadtytuł i akcje po prawej. */
export function PageHeader({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
