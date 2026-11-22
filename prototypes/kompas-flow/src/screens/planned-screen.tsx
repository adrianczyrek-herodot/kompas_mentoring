import { EmptyState, Link } from '@kompas/ui';
import { Construction } from 'lucide-react';
import { href } from '../lib/router';
import { type ScreenId, screenById } from './registry';

/** Screens of the map that stage 2 builds. Not a dead end: says why and where to go. */
export function PlannedScreen({ id }: { id: ScreenId }) {
  const screen = screenById(id);
  if (!screen) return null;
  return (
    <EmptyState
      titleAs="h2"
      icon={<Construction />}
      title={`${screen.id} · ${screen.name} — w przygotowaniu`}
      description={`Ten ekran powstanie w etapie 2 prototypu. Cel ekranu: ${screen.purpose}`}
      action={<Link href={href('/')}>Wróć na stronę główną</Link>}
    />
  );
}
