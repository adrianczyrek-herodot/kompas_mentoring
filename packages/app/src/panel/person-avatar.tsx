import { initials } from "@devmentor/ui/lib/format";
import { Avatar, AvatarFallback } from "@devmentor/ui/backend/avatar";
import { cn } from "@devmentor/ui/lib/utils";

/** Awatar osoby w panelu (shadcn/ui) z inicjałami w kolorze z odcienia `hue`. */
export function PersonAvatar({ name, hue, className }: { name: string; hue: number; className?: string }) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarFallback className="font-semibold" style={{ color: `hsl(${hue} 45% 22%)`, background: `hsl(${hue} 45% 86%)` }}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
