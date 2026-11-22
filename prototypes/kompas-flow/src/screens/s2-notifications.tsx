/**
 * S2 — Powiadomienia.
 * DS-GAP: NotificationItem
 */
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@kompas/ui';


export function S2Notifications() {
  const notifications = [
    {
      id: 'n1',
      title: 'Sesja za 1 godzinę',
      description: 'Twoja sesja z Kasią Nowicką zaczyna się o 15:00.',
      time: '13:00',
      type: 'reminder' as const,
      read: false,
    },
    {
      id: 'n2',
      title: 'Nowa wiadomość',
      description: 'Kasia Nowicka napisała do Ciebie w wątku „Architektura React".',
      time: '14:32',
      type: 'message' as const,
      read: false,
    },
    {
      id: 'n3',
      title: 'Sesja zakończona',
      description: 'Sesja z Tomaszem Wierzbickim została oznaczona jako ukończona.',
      time: 'wczoraj',
      type: 'session' as const,
      read: true,
    },
    {
      id: 'n4',
      title: 'Saldo odnowione',
      description: 'Twój plan został odnowiony. Masz 1 sesję do wykorzystania.',
      time: '2 dni temu',
      type: 'billing' as const,
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading-md text-text-primary">Powiadomienia</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="warning">{unreadCount} nieprzeczytanych</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-3 py-3 ${idx > 0 ? 'border-t border-surface-border' : ''} ${!notif.read ? 'bg-surface-secondary' : ''}`}
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
                <div className="flex-1">
                  <p className="text-body-semibold text-text-primary">{notif.title}</p>
                  <p className="text-body-dense text-text-muted">{notif.description}</p>
                  <p className="mt-1 text-meta text-text-muted">{notif.time}</p>
                </div>
                {!notif.read && (
                  <Button variant="ghost" size="sm">
                    Oznacz jako przeczytane
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
