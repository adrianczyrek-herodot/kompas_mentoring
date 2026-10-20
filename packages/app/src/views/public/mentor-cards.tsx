"use client";

import type { Mentor } from "@devmentor/core/domain";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Rating } from "@devmentor/ui/frontend/rating";
import { Tag, TagList } from "@devmentor/ui/frontend/tag";
import { toast } from "@devmentor/ui/frontend/toast";
import { money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { toUrl } from "@/demo/navigation";
import { notify, store } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";

export const cardClass = "rounded-card border border-line bg-surface p-[18px] shadow-card";

export function VerifiedMark() {
  return <span className="inline-flex text-ok" title="Zweryfikowany"><Icon name="shield" /></span>;
}

/** Mała karta mentora (polecani, podobni). */
export function MentorMiniCard({ mentor: m }: { mentor: Mentor }) {
  return (
    <Link href={`/mentorzy/${m.id}`} className={cn(cardClass, "flex flex-col items-start gap-1.5 no-underline transition-transform hover:-translate-y-0.5")}>
      <Avatar name={m.name} hue={m.hue} size={56} />
      <strong>{m.name}</strong>
      <span className="text-[0.85rem] text-ink-2">{m.headline.split("·")[0]}</span>
      <span className="flex items-center gap-2"><Rating value={m.rating} /><span className="text-[0.85rem] text-ink-2">{money(m.rate60)}/h</span></span>
    </Link>
  );
}

/** Przycisk „ulubiony” — stan w demo store. */
function FavoriteButton({ id }: { id: string }) {
  const { favorites } = useDemoStore();
  const on = favorites.has(id);
  const toggle = () => {
    if (store.favorites.has(id)) store.favorites.delete(id); else store.favorites.add(id);
    notify();
    toast(store.favorites.has(id) ? "Dodano do ulubionych" : "Usunięto z ulubionych");
  };
  return (
    <button type="button" data-fav={id} onClick={toggle} aria-pressed={on} aria-label="Ulubiony"
      className={cn("cursor-pointer border-0 bg-transparent p-1 text-[1.3rem]", on ? "text-accent" : "text-line")}>♥</button>
  );
}

/** Karta mentora na liście wyników (P2). */
export function MentorCard({ mentor: m }: { mentor: Mentor }) {
  return (
    <article className={cn(cardClass, "grid grid-cols-[88px_1fr] gap-3.5 md:grid-cols-[88px_1fr_190px]")}>
      <Link href={`/mentorzy/${m.id}`} className="relative block size-[88px]" aria-label={`Profil: ${m.name}`}>
        <Avatar name={m.name} hue={m.hue} size={88} />
        <span className="absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full bg-ink text-white"><Icon name="play" className="size-3" /></span>
      </Link>
      <div className="min-w-0">
        <div className="flex items-center justify-between">
          <Link href={`/mentorzy/${m.id}`} className="inline-flex items-center gap-1.5 font-serif text-[1.15rem] font-semibold no-underline">
            {m.name} {m.verified && <VerifiedMark />}
          </Link>
          <FavoriteButton id={m.id} />
        </div>
        <p className="mt-0.5 mb-0 font-medium">{m.headline}</p>
        <TagList>{m.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}</TagList>
        <p className="mb-2 line-clamp-2 text-[0.85rem] text-ink-2">{m.bio}</p>
        <div className="flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-2">
          <Rating value={m.rating} />
          {m.reviewsCount > 0 && <span>{m.reviewsCount} opinii</span>}
          <span>{m.sessions} sesji</span>
          <span>Odpowiada zwykle w {m.responseHours} h</span>
        </div>
      </div>
      <div className="col-span-full flex flex-wrap items-center gap-2 border-t border-line-2 pt-3 md:col-span-1 md:flex-col md:items-stretch md:border-t-0 md:border-l md:pt-0 md:pl-4">
        <div className="mr-auto md:mr-0 md:mb-1"><strong className="font-serif text-[1.35rem]">{money(m.rate60)}</strong><span className="text-[0.85rem] text-ink-2"> / 60 min</span></div>
        {m.acceptingNew
          ? <Link className={buttonVariants()} href={toUrl(`#/rezerwacja/${m.id}`)}>Sesja próbna{m.trialPrice ? ` · ${money(m.trialPrice)}` : ""}</Link>
          : <span className="inline-flex items-center rounded-full bg-line-2 px-[9px] py-0.5 text-[0.74rem] font-semibold text-ink-2">Nie przyjmuje nowych</span>}
        <Link className={buttonVariants({ variant: "ghost" })} href={toUrl(`#/wiadomosci/nowa?m=${m.id}`)}>Napisz</Link>
      </div>
    </article>
  );
}
