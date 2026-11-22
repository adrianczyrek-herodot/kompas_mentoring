/**
 * M1 — Onboarding mentora (6 kroków).
 * DS-GAP: OnboardingStepper, PhotoUpload, VideoLinkField, RateField, AvailabilityWeek, KycEmbed (symulacja), ProfileStatus
 */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FieldTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@kompas/ui';
import { useState } from 'react';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

const STEPS = [
  { id: 1, title: 'Profil', desc: 'Zdjęcie, imię i krótkie bio' },
  { id: 2, title: 'Doświadczenie', desc: 'Firmy, stanowiska, lata pracy' },
  { id: 3, title: 'Specjalizacja', desc: 'Tematy, technologie, tagi' },
  { id: 4, title: 'Sesja próbna', desc: 'Cena, długość, link wideo' },
  { id: 5, title: 'Dostępność', desc: 'Godziny, strefa czasowa' },
  { id: 6, title: 'Weryfikacja', desc: 'Dokumenty, zgody, wysyłka wniosku' },
];

export function M1Onboarding({ route }: { route: Route }) {
  const { state } = useDemo();
  const stepParam = parseInt((route.params)['krok'] ?? '1');
  const currentStep = Math.max(1, Math.min(6, stepParam));
  const [step, setStep] = useState(currentStep);
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    companies: '',
    specialties: '',
    trialPrice: '49',
    videoLink: '',
    timezone: 'Europe/Warsaw',
  });

  const nextStep = () => {
    if (step < 6) {
      navigate(`/mentor/onboarding/${step + 1}`);
    } else {
      // Submit
      alert('Wniosek wysłany! Zespół zaufania przejrzy go w ciągu 2 dni roboczych.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stepper */}
      <Card className="border-surface-border bg-surface-primary">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => { navigate(`/mentor/onboarding/${s.id}`); }}
                className={`flex flex-col items-center gap-1 ${s.id <= step ? 'text-text-primary' : 'text-text-muted opacity-50'}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-body-semibold ${s.id <= step ? 'bg-accent-primary text-white' : 'bg-surface-tertiary'}`}>
                  {s.id}
                </div>
                <span className="text-meta hidden sm:block">{s.title}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-body-dense text-text-muted">
            Krok {step} z 6: {(STEPS[step - 1]?.desc ?? '')}
          </p>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">{STEPS[step - 1]?.title ?? ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <FieldTitle>Zdjęcie profilowe</FieldTitle>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-tertiary text-xl font-bold text-text-primary">
                  ?
                </div>
                <Button variant="outline" size="sm">
                  Dodaj zdjęcie
                </Button>
              </div>
              <FieldTitle>Nagłówek</FieldTitle>
              <Input placeholder="np. Senior Frontend Engineer · React, TypeScript" value={formData.headline ?? ''} onChange={(e) => { setFormData({ ...formData, headline: e.target.value }); }} />
              <FieldTitle>Opis (bio)</FieldTitle>
              <Textarea placeholder="Kim jesteś i komu pomagasz..." rows={4} value={formData.bio} onChange={(e) => { setFormData({ ...formData, bio: e.target.value }); }} />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <FieldTitle>Firmy i stanowiska</FieldTitle>
              <Textarea placeholder="Frontend Developer @Allegro (2020–2024), Junior Dev @Brainly (2017–2020)" rows={4} value={formData.companies} onChange={(e) => { setFormData({ ...formData, companies: e.target.value }); }} />
              <FieldTitle>Lata doświadczenia</FieldTitle>
              <Select items={[
                { value: '3', label: '3 lata' },
                { value: '5', label: '5 lat' },
                { value: '7', label: '7 lat' },
                { value: '10', label: '10+ lat' },
              ]} value="7" onValueChange={() => {}} />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <FieldTitle>Specjalizacje</FieldTitle>
              <Textarea placeholder="React, TypeScript, architektura UI, code review" rows={3} value={formData.specialties} onChange={(e) => { setFormData({ ...formData, specialties: e.target.value }); }} />
              <FieldTitle>Tagi</FieldTitle>
              <Input placeholder="React, TypeScript, Next.js (oddzielone przecinkami)" />
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              <FieldTitle>Cena sesji próbnej (zł)</FieldTitle>
              <Input type="number" placeholder="49" value={formData.trialPrice} onChange={(e) => { setFormData({ ...formData, trialPrice: e.target.value }); }} />
              <FieldTitle>Link do wideo (symulacja)</FieldTitle>
              <Input placeholder="https://meet.example.com/your-link" value={formData.videoLink} onChange={(e) => { setFormData({ ...formData, videoLink: e.target.value }); }} />
              <p className="text-meta text-text-muted">To będzie link do pokoju sesyjnego.</p>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-3">
              <FieldTitle>Strefa czasowa</FieldTitle>
              <Select items={[
                { value: 'Europe/Warsaw', label: 'Warszawa (CET)' },
                { value: 'Europe/London', label: 'Londyn (GMT)' },
                { value: 'America/New_York', label: 'Nowy Jork (EST)' },
              ]} value={formData.timezone} onValueChange={(v) => { if (v) setFormData({ ...formData, timezone: v }); }} />
              <FieldTitle>Dostępne godziny (poniedziałek–piątek)</FieldTitle>
              <p className="text-body-dense text-text-muted">Ustawiamy cykliczną dostępność (9:00–18:00).</p>
              <div className="grid grid-cols-5 gap-2">
                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt'].map((day) => (
                  <label key={day} className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-accent-primary" />
                    <span className="text-body-dense text-text-primary">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col gap-3">
              <FieldTitle>Zgoda na przetwarzanie danych</FieldTitle>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-accent-primary" />
                <span className="text-body-dense text-text-primary">
                  Wyrażam zgodę na przetwarzanie moich danych osobowych przez Kompas.
                </span>
              </label>
              <FieldTitle>Zgoda na publikację profilu</FieldTitle>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-accent-primary" />
                <span className="text-body-dense text-text-primary">
                  Zgadzam się na publikację mojego profilu w wyszukiwarce mentorów.
                </span>
              </label>
              <p className="mt-2 text-body-dense text-text-muted">
                Po wysłaniu wniosku zespół zaufania przejrzy go w ciągu 2 dni roboczych.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={step === 1}
          onClick={() => { navigate(`/mentor/onboarding/${step - 1}`); }}
        >
          ← Poprzedni
        </Button>
        <Button onClick={nextStep}>
          {step === 6 ? 'Wyślij wniosek' : 'Dalej →'}
        </Button>
      </div>
    </div>
  );
}

function navigate(to: string): void {
  window.location.hash = `#${to}`;
}
