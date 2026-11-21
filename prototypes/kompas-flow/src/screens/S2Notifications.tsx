import React, { useState, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { formatDateTime, DEMO_NOW } from '../utils/mocks';
import { navigate } from '../utils/router';
import { useToast } from '../components/ToastContainer';

export function S2Notifications() {
  const { notifications, role } = useDemo();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [allRead, setAllRead] = useState(false);

  const filteredNotifications = filter === 'unread' ? notifications.filter(n => n.unread) : notifications;

  // Mark all as read
  useEffect(() => {
    if (allRead) {
      // In real app, dispatch action to mark all as read
      setAllRead(false);
    }
  }, [allRead]);

  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    const date = new Date(notif.at).toLocaleDateString('pl-PL', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="type-page-title font-serif">Powiadomienia</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select className="select-s" value={filter} onChange={e => setFilter(e.target.value as any)}>
            <option value="all">Wszystkie</option>
            <option value="unread">Tylko nieprzeczytane</option>
          </select>
          {notifications.some(n => n.unread) && (
            <button className="btn btn--ghost btn--s" onClick={() => { setAllRead(true); addToast('Wszystkie oznakzone jako przeczytane (symulacja)', 'success'); }}>
              Oznacz jako przeczytane
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔔</div>
          <h3 className="empty-state__title">{filter === 'unread' ? 'Brak nieprzeczytanych' : 'Brak powiadomień'}</h3>
          <p className="empty-state__text">
            {filter === 'unread' ? 'Wszystkie nadążasz!' : 'Powiadomienia pojawią się tutaj, gdy coś się wydarzy.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <section key={date}>
              <h3 className="type-label" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{date}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifs.map(notif => (
                  <a key={notif.at} href={notif.link} onClick={e => { e.preventDefault(); navigate(notif.link); }} className="list-item" style={{ textDecoration: 'none', color: 'inherit', background: notif.unread ? '#fffaf3' : 'transparent', fontWeight: notif.unread ? 600 : 400 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0 }}>{notif.text}</p>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(notif.at, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {notif.unread && <span className="dot" style={{ marginLeft: 'auto' }} />}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}