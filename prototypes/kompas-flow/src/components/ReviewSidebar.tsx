import { useState, useEffect } from 'react';
import { useReview } from '../context/ReviewContext';
import { useDemo } from '../context/DemoContext';
import { PROTO_BAR_HEIGHT, REVIEW_BAR_HEIGHT, SIDEBAR_WIDTH } from '../utils/constants';

export function ReviewSidebar() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    getCommentsForScreen, 
    addComment, 
    resolveComment, 
    deleteComment,
    activeCommentId,
    setActiveComment,
  } = useReview();
  const { activeScreen } = useDemo();
  const [newCommentText, setNewCommentText] = useState('');
  const [author, setAuthor] = useState('Anonimowy recenzent');

  // Load author from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kompas-flow-review-author');
      if (stored) setAuthor(stored);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kompas-flow-review-author', author);
    } catch {}
  }, [author]);

  const screenComments = activeScreen ? getCommentsForScreen(activeScreen) : [];

  if (!sidebarOpen) return null;

  return (
    <aside 
      className="review-sidebar" 
      style={{ 
        top: PROTO_BAR_HEIGHT, 
        bottom: REVIEW_BAR_HEIGHT,
        width: SIDEBAR_WIDTH,
        right: 0,
      }}
      aria-label="Panel komentarzy i przeglądu"
    >
      <div className="review-sidebar__header">
        <h2 className="review-sidebar__title">Komentarze recenzenta</h2>
        <button 
          className="review-sidebar__close" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Zamknij panel komentarzy"
        >
          ×
        </button>
      </div>

      <div className="review-sidebar__content">
        {/* Author field */}
        <div className="review-sidebar__section" style={{ borderBottom: '1px solid var(--border-divider)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Twoje imię / pseudonim
          </label>
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="input"
            style={{ width: '100%' }}
            placeholder="np. Jan K., Produkt Owner"
          />
        </div>

        {/* Add comment form */}
        <div className="review-sidebar__section">
          <h3 className="review-sidebar__section-title">Dodaj komentarz</h3>
          <form className="review-sidebar__form" onSubmit={e => {
            e.preventDefault();
            if (newCommentText.trim() && activeScreen) {
              addComment(activeScreen, author, newCommentText.trim());
              setNewCommentText('');
            }
          }}>
            <textarea
              className="review-sidebar__textarea"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder={activeScreen ? `Komentarz do ekranu ${activeScreen}…` : 'Wybierz ekran na górnym pasku'}
              disabled={!activeScreen}
              rows={4}
            />
            <button 
              type="submit" 
              className="btn btn--primary review-sidebar__submit"
              disabled={!activeScreen || !newCommentText.trim()}
            >
              Dodaj komentarz
            </button>
          </form>
        </div>

        {/* Comments list */}
        <div className="review-sidebar__section">
          <h3 className="review-sidebar__section-title">
            Komentarze {activeScreen ? `do ${activeScreen}` : '(wszystkie)'}
            <span className="badge badge--neutral" style={{ fontSize: '0.7rem', marginLeft: '8px' }}>
              {screenComments.length}
            </span>
          </h3>
          
          {screenComments.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state__icon">💬</div>
              <p className="empty-state__text" style={{ fontSize: '0.875rem' }}>
                {activeScreen ? 'Brak komentarzy do tego ekranu.' : 'Wybierz ekran, aby zobaczyć komentarze.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {screenComments.map(comment => (
                <div 
                  key={comment.id} 
                  className="review-sidebar__comment"
                  style={{ 
                    borderLeft: activeCommentId === comment.id ? '3px solid var(--action-primary)' : 'none',
                    background: activeCommentId === comment.id ? 'var(--selected-bg)' : 'var(--surface-page)',
                  }}
                >
                  <div className="review-sidebar__comment-header">
                    <span className="review-sidebar__comment-author">{comment.author}</span>
                    <span className="review-sidebar__comment-screen">{comment.screenId}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      {new Date(comment.createdAt).toLocaleString('pl-PL', { 
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="review-sidebar__comment-text">
                    {comment.text}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => setActiveComment(activeCommentId === comment.id ? null : comment.id)}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {activeCommentId === comment.id ? '✕ Zamknij' : '🔍 Rozwiń'}
                    </button>
                    {!comment.resolved && (
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => resolveComment(comment.id)}
                        style={{ fontSize: '0.7rem' }}
                      >
                        ✓ Rozwiązane
                      </button>
                    )}
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => deleteComment(comment.id)}
                      style={{ fontSize: '0.7rem', color: 'var(--status-danger-fg)' }}
                    >
                      🗑️ Usuń
                    </button>
                  </div>
                  {comment.resolved && (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'var(--status-success-bg)', borderRadius: 'var(--shape-control)', fontSize: '0.75rem', color: 'var(--status-success-fg)' }}>
                      ✓ Oznaczone jako rozwiązane
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}