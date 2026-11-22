/**
 * S1 — Wiadomości.
 * DS-GAP: ThreadList, MessageBubble
 */
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@kompas/ui';

export function S1Messages() {
  // Simulated threads
  const threads = [
    {
      id: 't1',
      otherName: 'Kasia Nowicka',
      lastMessage: 'Umówiłam Cię na środę 18:00. Do usłyszenia!',
      lastTime: '14:32',
      unread: 1,
      isMentor: true,
    },
    {
      id: 't2',
      otherName: 'Tomasz Wierzbicki',
      lastMessage: 'Dziękuję za feedback na sesji.',
      lastTime: 'wczoraj',
      unread: 0,
      isMentor: false,
    },
  ];

  const selectedThreadId = undefined;
  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  if (selectedThread) {
    return (
      <div className="flex flex-col gap-4">
        {/* Thread header */}
        <Card className="border-surface-border bg-surface-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-heading-sm text-text-primary">
              {selectedThread.otherName}
            </CardTitle>
            <p className="text-meta text-text-muted">
              {selectedThread.isMentor ? 'Mentor' : 'Uczeń'} · Ostatnia aktywność: dziś 14:30
            </p>
          </CardHeader>
        </Card>

        {/* Messages */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Card className="max-w-md border-surface-border bg-accent-primary/10">
              <CardContent className="py-2">
                <p className="text-body-dense text-text-primary">Cześć Kasiu, chciałbym omówić architekturę React.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex">
            <Card className="max-w-md border-surface-border bg-surface-secondary">
              <CardContent className="py-2">
                <p className="text-body-dense text-text-primary">Świetnie! Masz jakieś konkretne pytania?</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Card className="max-w-md border-surface-border bg-accent-primary/10">
              <CardContent className="py-2">
                <p className="text-body-dense text-text-primary">Tak, szczególnie dotycząca zarządzania stanem.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex">
            <Card className="max-w-md border-surface-border bg-surface-secondary">
              <CardContent className="py-2">
                <p className="text-body-dense text-text-primary">Umówiłam Cię na środę 18:00. Do usłyszenia!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reply */}
        <Card className="border-surface-border bg-surface-primary">
          <CardContent className="py-3">
            <Textarea placeholder="Napisz wiadomość..." rows={2} />
            <Button size="sm" className="mt-2">Wyślij</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Thread list
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-surface-border bg-surface-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-md text-text-primary">Wiadomości</CardTitle>
        </CardHeader>
        <CardContent>
          {threads.map((thread) => (
            <a
              key={thread.id}
              href={`#/wiadomosci/${thread.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-body-semibold text-text-primary">
                  {thread.otherName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-body-semibold text-text-primary">{thread.otherName}</p>
                  <p className="text-body-dense text-text-muted line-clamp-1">{thread.lastMessage}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-meta text-text-muted">{thread.lastTime}</p>
                {thread.unread > 0 && (
                  <Badge variant="warning">{thread.unread}</Badge>
                )}
              </div>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
