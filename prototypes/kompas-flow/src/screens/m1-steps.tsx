/**
 * M1 steps: draft values, validation per step (KONCEPCJA §M1 „Walidacje”) and the fields of the six
 * steps. Values are strings, because the draft in the demo state is `Record<string, string>`.
 */
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  initialsOf,
  Input,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@kompas/ui';
import { Camera, Check, Video } from 'lucide-react';
import { useId } from 'react';
import type { Availability } from '../data/mentor-work';
import { commissionPercent } from '../data/mentor-work';
import { CATEGORIES, type Mentor } from '../data/mentors';
import { AvailabilityGrid, totalHours } from './m3-template';

export type Values = Record<string, string>;
export type Errors = Record<string, string>;
export type StepProps = {
  values: Values;
  errors: Errors;
  set: (key: string, value: string) => void;
  /** Simulated upload / KYC in flight (photo, video file, KYC). */
  simBusy: string | null;
  simulate: (key: string, value: string) => void;
};

export const STEP_NAMES = ['O mnie', 'Kompetencje', 'Opis i wideo', 'Stawka', 'Dostępność', 'Weryfikacja'];

const COUNTRIES = ['Polska', 'Niemcy', 'Wielka Brytania', 'Irlandia', 'Holandia', 'Ukraina'];
const LANGUAGES = ['polski', 'angielski', 'niemiecki', 'ukraiński'];
const VIDEO_LINK = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//;

const list = (text: string | undefined): string[] =>
  (text ?? '').split(',').map((x) => x.trim()).filter(Boolean);

function parseAvailability(text: string | undefined): Availability {
  const result: Availability = {};
  for (const part of (text ?? '').split(';').filter(Boolean)) {
    const [day = '', hours = ''] = part.split(':');
    result[Number(day)] = hours.split('.').filter(Boolean).map(Number);
  }
  return result;
}

function serializeAvailability(value: Availability): string {
  return Object.entries(value).map(([day, hours]) => `${day}:${hours.join('.')}`).join(';');
}

/** Starting values: the candidate's data from `mentors.ts`, overridden by what the draft holds. */
export function draftValues(mentor: Mentor | undefined, draft: Values): Values {
  const defaults: Values = mentor
    ? {
        name: mentor.name,
        country: mentor.country,
        languages: mentor.languages.join(','),
        categories: mentor.categories.join(','),
        tags: mentor.tags.join(', '),
        years: String(mentor.yearsExp),
        companies: mentor.companies.join(', '),
        headline: mentor.headline,
        bio: mentor.bio,
        rate: String(mentor.rate60 / 100n),
        availability: serializeAvailability(mentor.availability),
      }
    : {};
  return { ...defaults, ...draft };
}

const between = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;

export function validateStep(step: number, v: Values): Errors {
  const e: Errors = {};
  switch (step) {
    case 1: {
      const name = (v['name'] ?? '').trim().length;
      if (name < 2 || name > 60) e['name'] = 'Imię i nazwisko: 2–60 znaków.';
      if (!v['country']) e['country'] = 'Wybierz kraj.';
      if (list(v['languages']).length === 0) e['languages'] = 'Wybierz co najmniej jeden język sesji.';
      if (!v['photo']) e['photo'] = 'Dodaj zdjęcie — profile bez zdjęcia nie przechodzą weryfikacji.';
      break;
    }
    case 2: {
      const categories = list(v['categories']).length;
      if (categories < 1 || categories > 5) e['categories'] = `Wybierz od 1 do 5 kategorii (teraz ${String(categories)}).`;
      const tags = list(v['tags']).length;
      if (tags < 3 || tags > 15) e['tags'] = `Podaj 3–15 umiejętności (teraz ${String(tags)}).`;
      if (!between(Number(v['years'] ?? ''), 1, 50) || (v['years'] ?? '').trim() === '') e['years'] = 'Lata doświadczenia: liczba całkowita od 1 do 50.';
      break;
    }
    case 3: {
      const headline = (v['headline'] ?? '').trim().length;
      if (headline < 20 || headline > 80) e['headline'] = `Nagłówek: 20–80 znaków (teraz ${String(headline)}).`;
      const bio = (v['bio'] ?? '').trim().length;
      if (bio < 300 || bio > 2000) e['bio'] = `Opis: 300–2000 znaków (teraz ${String(bio)}).`;
      const url = (v['videoUrl'] ?? '').trim();
      if (url && !VIDEO_LINK.test(url)) e['videoUrl'] = 'Link musi prowadzić do YouTube lub Vimeo (zaczynać się od https://).';
      else if (!url && !v['video']) e['videoUrl'] = 'Dodaj plik wideo albo link — profile z wideo mają wyraźnie więcej rezerwacji.';
      break;
    }
    case 4:
      if (!between(Number(v['rate'] ?? ''), 40, 1000) || (v['rate'] ?? '').trim() === '') e['rate'] = 'Stawka: pełne złote, od 40 do 1000 zł za 60 minut.';
      break;
    case 5: {
      const hours = totalHours(parseAvailability(v['availability']));
      if (hours < 3) e['availability'] = `Zaznacz co najmniej 3 godziny tygodniowo (teraz ${String(hours)}).`;
      break;
    }
    default: {
      if (!(v['linkedin'] ?? '').includes('linkedin.com/in/')) e['linkedin'] = 'Podaj link w formacie linkedin.com/in/…';
      if (!v['kyc']) e['kyc'] = 'Zweryfikuj tożsamość u operatora, zanim wyślesz wniosek.';
      if (!/^PL\d{26}$/.test((v['iban'] ?? '').replace(/\s/g, '').toUpperCase())) e['iban'] = 'Polski numer konta: PL i 26 cyfr.';
      if (!v['terms']) e['terms'] = 'Akceptacja regulaminu dla mentorów jest wymagana.';
    }
  }
  return e;
}

function Text({ k, label, f, description, type = 'text', maxLength }: { k: string; label: string; f: StepProps; description?: string; type?: string; maxLength?: number }) {
  const id = useId();
  const error = f.errors[k];
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        {...(maxLength ? { maxLength } : {})}
        value={f.values[k] ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => { f.set(k, e.target.value); }}
      />
      {error ? <FieldError id={`${id}-e`}>{error}</FieldError> : description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

function CheckGroup({ k, legend, options, f, hint }: { k: string; legend: string; options: string[]; f: StepProps; hint?: string }) {
  const id = useId();
  const chosen = list(f.values[k]);
  const error = f.errors[k];
  return (
    <FieldSet data-invalid={error ? true : undefined}>
      <FieldLegend variant="label">{legend}</FieldLegend>
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <div className="flex flex-col gap-inline md:flex-row md:flex-wrap md:gap-group">
        {options.map((option, index) => (
          <div key={option} className="flex items-center gap-inline">
            <Checkbox
              id={`${id}-${String(index)}`}
              checked={chosen.includes(option)}
              aria-invalid={error ? true : undefined}
              onCheckedChange={(checked) => { f.set(k, (checked ? [...chosen, option] : chosen.filter((c) => c !== option)).join(',')); }}
            />
            <label htmlFor={`${id}-${String(index)}`} className="text-body">{option}</label>
          </div>
        ))}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </FieldSet>
  );
}

export function Step1({ f }: { f: StepProps }) {
  const id = useId();
  const country = f.values['country'] ?? '';
  const items = COUNTRIES.map((c) => ({ value: c, label: c }));
  return (
    <>
      <Field data-invalid={f.errors['photo'] ? true : undefined}>
        <FieldLabel>Zdjęcie profilowe</FieldLabel>
        <div className="flex items-center gap-group">
          <Avatar size="lg"><AvatarFallback>{f.values['photo'] ? initialsOf(f.values['name'] ?? '') : <Camera aria-hidden="true" />}</AvatarFallback></Avatar>
          <div className="flex flex-col items-start gap-tight">
            <Button type="button" variant="outline" size="sm" loading={f.simBusy === 'photo'} onClick={() => { f.simulate('photo', 'zdjecie.jpg'); }}>
              {f.values['photo'] ? 'Zmień zdjęcie (symulacja)' : 'Dodaj zdjęcie (symulacja)'}
            </Button>
            {f.values['photo'] ? <p className="flex items-center gap-tight text-body-dense"><Check aria-hidden="true" className="size-icon-sm" />Dodano: {f.values['photo']} (symulacja)</p> : null}
          </div>
        </div>
        {f.errors['photo'] ? <FieldError>{f.errors['photo']}</FieldError> : <FieldDescription>JPG lub PNG, min. 400×400 px, do 5 MB, wyraźnie widoczna twarz. W prototypie nie wczytujemy żadnego pliku.</FieldDescription>}
      </Field>
      <Text k="name" label="Imię i nazwisko" f={f} />
      <Field data-invalid={f.errors['country'] ? true : undefined}>
        <FieldLabel htmlFor={`${id}-country`}>Kraj</FieldLabel>
        <Select items={items} value={country} onValueChange={(next) => { f.set('country', next ?? ''); }}>
          <SelectTrigger id={`${id}-country`} aria-invalid={f.errors['country'] ? true : undefined}><SelectValue /></SelectTrigger>
          <SelectContent>{items.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
        </Select>
        {f.errors['country'] ? <FieldError>{f.errors['country']}</FieldError> : null}
      </Field>
      <CheckGroup k="languages" legend="Języki sesji" options={LANGUAGES} f={f} />
    </>
  );
}

export function Step2({ f }: { f: StepProps }) {
  const tags = list(f.values['tags']);
  return (
    <>
      <CheckGroup k="categories" legend="Kategorie (1–5)" options={CATEGORIES} f={f} />
      {/* DS-GAP: TagInput — the DS has none; tags are a comma-separated Input with a live list. */}
      <Text k="tags" label="Umiejętności (3–15, oddziel przecinkami)" f={f} description={`Teraz: ${String(tags.length)}. np. React, TypeScript, Code review`} />
      {tags.length > 0 ? <ul aria-label="Podgląd umiejętności" className="flex flex-wrap gap-tight">{tags.map((t) => <li key={t}><Badge variant="neutral">{t}</Badge></li>)}</ul> : null}
      <Text k="years" label="Lata doświadczenia" type="number" f={f} />
      <Text k="companies" label="Firmy (opcjonalnie, oddziel przecinkami)" f={f} />
    </>
  );
}

export function Step3({ f }: { f: StepProps }) {
  const id = useId();
  const bio = f.values['bio'] ?? '';
  return (
    <>
      <Text k="headline" label="Nagłówek profilu (20–80 znaków)" f={f} maxLength={80} description={`${String((f.values['headline'] ?? '').length)} / 80 znaków`} />
      <Field data-invalid={f.errors['bio'] ? true : undefined}>
        <FieldLabel htmlFor={`${id}-bio`}>Opis: z czym pomagasz i jak pracujesz (300–2000 znaków)</FieldLabel>
        <Textarea id={`${id}-bio`} rows={7} maxLength={2000} showCount value={bio} aria-invalid={f.errors['bio'] ? true : undefined} aria-describedby={f.errors['bio'] ? `${id}-bio-e` : undefined} onChange={(e) => { f.set('bio', e.target.value); }} />
        {f.errors['bio'] ? <FieldError id={`${id}-bio-e`}>{f.errors['bio']}</FieldError> : null}
      </Field>
      <FieldSet>
        <FieldLegend variant="label">Wideo powitalne</FieldLegend>
        <div className="flex flex-col items-start gap-tight">
          <Button type="button" variant="outline" size="sm" loading={f.simBusy === 'video'} onClick={() => { f.simulate('video', 'powitanie.mp4 · 1:42'); }}>
            <Video aria-hidden="true" />
            {f.values['video'] ? 'Zmień plik wideo (symulacja)' : 'Wybierz plik wideo (symulacja)'}
          </Button>
          {f.values['video'] ? <p className="flex items-center gap-tight text-body-dense"><Check aria-hidden="true" className="size-icon-sm" />Dodano: {f.values['video']} (symulacja)</p> : null}
          <p className="text-body-dense text-text-muted">MP4 lub MOV, 30 s – 3 min, do 200 MB. W prototypie nie wczytujemy pliku.</p>
        </div>
      </FieldSet>
      <Text k="videoUrl" label="Albo link do YouTube / Vimeo" f={f} description="np. https://youtu.be/…" />
    </>
  );
}

export function Step4({ f }: { f: StepProps }) {
  const rate = Number(f.values['rate'] ?? '');
  const valid = Number.isInteger(rate) && rate >= 40 && rate <= 1000;
  const gross = valid ? BigInt(rate) * 100n : 0n;
  const net = (hours: number) => (gross * BigInt(100 - commissionPercent(hours))) / 100n;
  const tiers = [0, 20, 50, 200].map(commissionPercent).join('% → ');
  return (
    <>
      <Text k="rate" label="Stawka za 60 minut (zł)" type="number" f={f} description="Sesja 30 minut kosztuje połowę stawki." />
      <section aria-labelledby="m1-earn" className="flex flex-col gap-inline">
        <h2 id="m1-earn" className="text-label font-medium">Ile zarobisz po prowizji</h2>
        {valid ? (
          <dl className="grid grid-cols-1 gap-group md:grid-cols-2">
            <div className="flex flex-col gap-tight"><dt className="text-meta text-text-muted">Za 60 min na start (prowizja {commissionPercent(0)}%)</dt><dd className="text-section-title font-semibold"><Money amount={net(0)} /></dd></div>
            <div className="flex flex-col gap-tight"><dt className="text-meta text-text-muted">Za 60 min po 200 h (prowizja {commissionPercent(200)}%)</dt><dd className="text-section-title font-semibold"><Money amount={net(200)} /></dd></div>
          </dl>
        ) : (
          <p className="text-body-dense text-text-muted">Wpisz stawkę od 40 do 1000 zł, a pokażemy zarobek.</p>
        )}
        <p className="max-w-measure text-body-dense text-text-muted">Prowizja maleje z liczbą przepracowanych godzin: {tiers}%. Sesja próbna w całości jest prowizją platformy.</p>
      </section>
    </>
  );
}

export function Step5({ f }: { f: StepProps }) {
  const value = parseAvailability(f.values['availability']);
  return (
    <>
      <p className="max-w-measure text-body-dense text-text-muted">Zaznacz godziny, od których uczniowie mogą rezerwować sesje (strefa Europe/Warsaw). Minimum 3 godziny tygodniowo.</p>
      <AvailabilityGrid value={value} onChange={(next) => { f.set('availability', serializeAvailability(next)); }} />
      <p aria-live="polite" className="text-body-dense text-text-muted">{totalHours(value)} h tygodniowo</p>
      {f.errors['availability'] ? <FieldError>{f.errors['availability']}</FieldError> : null}
    </>
  );
}

export function Step6({ f }: { f: StepProps }) {
  const id = useId();
  return (
    <>
      <Text k="linkedin" label="Profil LinkedIn" f={f} description="np. https://linkedin.com/in/twoj-profil" />
      <Field data-invalid={f.errors['kyc'] ? true : undefined}>
        <FieldLabel>Weryfikacja tożsamości</FieldLabel>
        <div className="flex flex-col items-start gap-tight">
          <Button type="button" variant="outline" size="sm" loading={f.simBusy === 'kyc'} disabled={Boolean(f.values['kyc'])} onClick={() => { f.simulate('kyc', '1'); }}>
            {f.values['kyc'] ? 'Zweryfikowano (symulacja)' : 'Rozpocznij u operatora (symulacja)'}
          </Button>
          <p className="max-w-measure text-body-dense text-text-muted">Dokument tożsamości sprawdza zewnętrzny operator KYC (ok. 3 minuty). W prototypie to symulacja — nie podawaj żadnych prawdziwych dokumentów.</p>
        </div>
        {f.errors['kyc'] ? <FieldError>{f.errors['kyc']}</FieldError> : null}
      </Field>
      <Text k="iban" label="Numer konta do wypłat (IBAN)" f={f} description="Nie wpisuj prawdziwego numeru — to prototyp, dane nie są nigdzie wysyłane. Przykład: PL61 1090 1014 0000 0712 1981 2874" />
      <Field data-invalid={f.errors['terms'] ? true : undefined}>
        <div className="flex items-center gap-inline">
          <Checkbox id={`${id}-terms`} checked={Boolean(f.values['terms'])} aria-invalid={f.errors['terms'] ? true : undefined} onCheckedChange={(checked) => { f.set('terms', checked ? '1' : ''); }} />
          <label htmlFor={`${id}-terms`} className="text-body">Akceptuję regulamin dla mentorów (m.in. zakaz rozliczeń poza platformą)</label>
        </div>
        {f.errors['terms'] ? <FieldError>{f.errors['terms']}</FieldError> : null}
      </Field>
    </>
  );
}
