/**
 * S3 — Konto i ustawienia.
 * DS-GAP: DataRequestRow
 */
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FieldTitle,
  Input,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@kompas/ui';
import { useState } from 'react';
import type { Route } from '../lib/router';
import { useDemo } from '../state/demo-context';

export function S3Account({ route }: { route: Route }) {
  const { state, account } = useDemo();
  if (account.role === 'guest') return null;

  const [dataExportOpen, setDataExportOpen] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Profile section */}
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary text-xl font-bold text-text-primary">
              {account.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-body-semibold text-text-primary">{account.name}</p>
              <p className="text-body-dense text-text-muted">
                {account.role === 'student' ? 'Uczeń' : account.role === 'mentor' ? 'Mentor' : 'Admin'}
              </p>
              {account.role === 'mentor' && !account.approved && (
                <Badge variant="warning" className="mt-1">Weryfikacja w toku</Badge>
              )}
            </div>
            <Button variant="outline" size="sm">Edytuj profil</Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings tabs */}
      <Tabs defaultValue="notifications" className="flex flex-col gap-3">
        <TabsList>
          <TabsTrigger value="notifications">Powiadomienia</TabsTrigger>
          <TabsTrigger value="security">Bezpieczeństwo</TabsTrigger>
          <TabsTrigger value="data">Dane (RODO)</TabsTrigger>
        </TabsList>

        {/* Notifications tab */}
        <div className="space-y-3" id="notifications-panel">
          <Card className="border-surface-border bg-surface-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <FieldTitle>Powiadomienia e-mail</FieldTitle>
                  <p className="text-meta text-text-muted">Otrzymuj przypomnienia o sesjach na e-mail.</p>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-surface-border bg-surface-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <FieldTitle>Powiadomienia push</FieldTitle>
                  <p className="text-meta text-text-muted">Otrzymuj powiadomienia w przeglądarce.</p>
                </div>
                <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security tab */}
        <div className="hidden space-y-3" id="security-panel">
          <Card className="border-surface-border bg-surface-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-semibold text-text-primary">Zmień hasło</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Obecne hasło" type="password" className="mb-2" />
              <Input placeholder="Nowe hasło" type="password" className="mb-2" />
              <Input placeholder="Powtórz nowe hasło" type="password" className="mb-2" />
              <Button size="sm">Zapisz hasło</Button>
            </CardContent>
          </Card>
        </div>

        {/* Data tab */}
        <div className="hidden space-y-3" id="data-panel">
          <Card className="border-surface-border bg-surface-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-semibold text-text-primary">Twoje dane</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-dense text-text-muted mb-3">
                Masz prawo do dostępu, sprostowania i usunięcia swoich danych.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => { setDataExportOpen(true); }}>
                  Eksportuj moje dane (.json)
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  Poproś o usunięcie konta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Data export dialog */}
      <AlertDialog open={dataExportOpen} onOpenChange={setDataExportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eksport danych</AlertDialogTitle>
            <AlertDialogDescription>
              Czy chcesz pobrać archiwum ze wszystkimi swoimi danymi? Plik zawiera informacje o profilu, sesjach i wiadomościach.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => { setDataExportOpen(false); }}>Anuluj</Button>
            <Button>Pobierz</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
