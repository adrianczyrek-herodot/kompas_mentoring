export function LoadingFallback() {
  return (
    <div className="skeleton-wrap" style={{ padding: 'var(--space-section) var(--space-group)', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div className="sk sk--hero" style={{ height: '200px' }} aria-hidden="true" />
      <div className="sk sk--card" aria-hidden="true" />
      <div className="sk sk--card" aria-hidden="true" />
      <div className="sk sk--card" aria-hidden="true" />
    </div>
  );
}