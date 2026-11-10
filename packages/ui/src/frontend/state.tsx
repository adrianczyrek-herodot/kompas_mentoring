import type { ReactNode } from "react";
import { buttonVariants } from "./button";
import { Icon } from "./icon";

function StateBox({ icon, iconClass, title, text, children, role }: {
  icon: string; iconClass: string; title: string; text: string; children?: ReactNode; role?: "alert";
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-8 text-center" role={role}>
      <Icon name={icon} className={`mb-1.5 size-[38px] ${iconClass}`} />
      <h3 className="mb-1.5 font-serif text-[1.12rem] font-semibold">{title}</h3>
      <p className="mb-3 max-w-[420px] text-ink-2">{text}</p>
      {children}
    </div>
  );
}

/** Stan „empty”: brak danych + opcjonalna akcja. */
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <StateBox icon="target" iconClass="text-brand-2" title={title} text={text}>{action}</StateBox>;
}

/** Stan „error” z przyciskiem ponowienia. */
export function ErrorState({ text = "Nie udało się wczytać danych.", onRetry }: { text?: string; onRetry?: () => void }) {
  return (
    <StateBox icon="alert" iconClass="text-err" title="Coś poszło nie tak" text={text} role="alert">
      {onRetry && (
        <button type="button" className={buttonVariants({ variant: "ghost" })} onClick={onRetry}>
          Spróbuj ponownie
        </button>
      )}
    </StateBox>
  );
}
