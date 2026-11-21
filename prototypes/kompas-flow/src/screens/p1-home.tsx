/** P1 · Strona główna (KONCEPCJA §P1, E2-S7). */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Link,
  MentorCard,
  MentorCardSkeleton,
} from '@kompas/ui';
import { Search, ShieldCheck } from 'lucide-react';
import { type SyntheticEvent, useId, useState } from 'react';
import { CATEGORIES, PUBLIC_MENTORS } from '../data/mentors';
import { href, navigate, withQuery } from '../lib/router';
import { useDemo } from '../state/demo-context';

const STEPS = [
  { title: 'Znajdź mentora', text: 'Filtruj po temacie, cenie, języku i dostępności.' },
  { title: 'Umów sesję próbną', text: '30 minut w niższej cenie — sprawdzisz, czy się dogadacie.' },
  { title: 'Wybierz plan', text: 'Stały rytm sesji co tydzień, rozliczany co 4 tygodnie.' },
];

function TopicSearch() {
  const id = useId();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const text = query.trim();
    // Empty query → the full list; otherwise 2–80 characters (KONCEPCJA §P1 „Walidacje”).
    if (text.length === 1 || text.length > 80) {
      setError('Wpisz od 2 do 80 znaków albo zostaw pole puste, żeby zobaczyć wszystkich.');
      return;
    }
    navigate(withQuery('/mentorzy', { temat: text || undefined }));
  };
  // DS-GAP: TopicSearch (autocomplete of topics) — a plain Field + Input + Button here.
  return (
    <form role="search" onSubmit={submit} noValidate className="flex max-w-form flex-col gap-inline">
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={id}>Czego chcesz się nauczyć?</FieldLabel>
        <div className="flex flex-col gap-inline md:flex-row">
          <Input
            id={id}
            value={query}
            placeholder="np. React, awans na lidera, portfolio UX"
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setError(null);
            }}
          />
          <Button type="submit" size="lg">
            <Search aria-hidden="true" />
            Szukaj mentora
          </Button>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <FieldDescription>Puste pole pokaże wszystkich mentorów.</FieldDescription>
      </Field>
    </form>
  );
}

function Featured() {
  const { state } = useDemo();
  const status = state.scenarios.dataState;
  // E — no featured mentors → the section is hidden (KONCEPCJA §P1).
  if (status === 'empty') return null;
  return (
    <section aria-labelledby="featured-h" className="flex flex-col gap-inline">
      <h2 id="featured-h" className="text-section-title font-semibold">
        Wyróżnieni mentorzy
      </h2>
      {status === 'loading' ? (
        <div aria-busy="true">
          <p className="sr-only">Wczytujemy wyróżnionych mentorów…</p>
          {[0, 1, 2, 3].map((row) => (
            <MentorCardSkeleton key={row} />
          ))}
        </div>
      ) : status === 'error' ? (
        <ErrorState
          titleAs="h3"
          title="Nie udało się wczytać wyróżnionych mentorów"
          description="Wyszukiwarka działa normalnie — wpisz temat powyżej."
          action={<Link href={href('/mentorzy')}>Przejdź do wyszukiwarki</Link>}
        />
      ) : (
        <ul aria-label="Wyróżnieni mentorzy">
          {PUBLIC_MENTORS.slice(0, 4).map((mentor) => (
            <li key={mentor.id}>
              <MentorCard
                mentor={mentor}
                profileHref={href(`/mentorzy/${mentor.id}`)}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate(`/mentorzy/${mentor.id}`);
                    }}
                  >
                    Zobacz profil<span className="sr-only"> — {mentor.name}</span>
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function P1Home() {
  return (
    <>
      <section aria-labelledby="hero-h" className="flex flex-col gap-group">
        <h1 id="hero-h" className="font-serif text-display font-semibold">
          Mentoring 1:1 z praktykami z IT, kariery, biznesu i designu
        </h1>
        <p className="max-w-measure text-body text-text-muted">
          Zacznij od tańszej 30-minutowej sesji próbnej. Jeśli mentor nie pasuje — darmowa zamiana
          albo zwrot.
        </p>
        <TopicSearch />
      </section>

      <section aria-labelledby="categories-h" className="flex flex-col gap-inline">
        <h2 id="categories-h" className="text-section-title font-semibold">
          Popularne tematy
        </h2>
        {/* DS-GAP: CategoryList (KONCEPCJA „CategoryChips”) — links in a wrapped list. */}
        <ul className="flex flex-wrap gap-inline">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <Link href={href(withQuery('/mentorzy', { kategoria: category }))}>{category}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-h" className="flex flex-col gap-inline">
        <h2 id="how-h" className="text-section-title font-semibold">
          Jak to działa
        </h2>
        <ol className="grid gap-group md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {index + 1}. {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-dense">{step.text}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
        <p className="flex items-center gap-inline text-body-dense">
          <ShieldCheck aria-hidden="true" className="size-icon-md text-status-success-fg" />
          Gwarancja sesji próbnej: zamiana mentora albo zwrot pieniędzy.
        </p>
      </section>

      <Featured />

      <section aria-labelledby="become-h" className="flex flex-col items-start gap-inline">
        <h2 id="become-h" className="text-section-title font-semibold">
          Masz doświadczenie, którym chcesz się dzielić?
        </h2>
        <p className="text-body text-text-muted">
          Profil mentora jest publiczny po weryfikacji przez zespół zaufania.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            navigate(withQuery('/rejestracja', { rola: 'mentor' }));
          }}
        >
          Zostań mentorem
        </Button>
      </section>
    </>
  );
}
