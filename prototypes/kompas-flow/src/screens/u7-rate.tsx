/**
 * U7 — Ocena sesji.
 * DS-GAP: StarInput (budowane z RadioGroup + Button)
 */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  FieldTitle,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@kompas/ui';
import { useState } from 'react';
import { useDemo } from '../state/demo-context';

export function U7Rate({ route }: { route: Route }) {
  const { state, myBookings } = useDemo();
  const booking = myBookings.find((b) => b.id === (route.params)['id']);
  if (!booking) return null;

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [continueWithMentor, setContinueWithMentor] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="border-surface-border bg-surface-primary">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-heading-md text-text-primary">Dziękujemy za ocenę!</p>
          <p className="mt-2 text-body text-text-muted">
            Twoja opinia pomoże naszemu mentorowi i innym uczniom.
          </p>
          {continueWithMentor && (
            <p className="mt-4 text-body-dense text-text-muted">
              Kontynuujesz współpracę z tym mentorem.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Oceń sesję</CardTitle>
          <p className="text-body text-text-muted">
            Jak oceniasz dzisiejszą sesję z mentorem?
          </p>
        </CardHeader>
        <CardContent>
          {/* Star rating using buttons */}
          <FieldTitle>Ocena</FieldTitle>
          <div className="mb-4 flex gap-1" role="radiogroup" aria-label="Ocena od 1 do 5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant={rating >= star ? 'default' : 'outline'}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => { setRating(star); }}
                aria-label={`${star} gwiazdek`}
              >
                {star <= rating ? '★' : '☆'}
              </Button>
            ))}
          </div>

          {/* Feedback */}
          <FieldTitle>Co było najlepsze?</FieldTitle>
          <Textarea
            placeholder="Napisz, co było wartościowe..."
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); }}
            rows={3}
            className="mb-4"
          />

          {/* Continue checkbox */}
          <label className="flex items-center gap-2">
            <Checkbox
              id="continue"
              checked={continueWithMentor}
              onCheckedChange={(checked) => { setContinueWithMentor(!!checked); }}
            />
            <span className="text-body-dense text-text-primary">
              Chcę kontynuować współpracę z tym mentorem
            </span>
          </label>
        </CardContent>
      </Card>

      <Button
        size="lg"
        disabled={rating === 0}
        onClick={() => { setSubmitted(true); }}
      >
        Wyślij ocenę
      </Button>
    </div>
  );
}

import type { Route } from '../lib/router';
