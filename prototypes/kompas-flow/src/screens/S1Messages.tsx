import React from 'react';
import { navigate } from '../utils/router';

export function S1Messages() {
  return (
    <div className="screen-enter">
      <h1 className="type-page-title font-serif">S1Messages</h1>
      <p className="text-muted" style={{ marginTop: '1rem' }}>Ekran w budowie</p>
      <a href="#/" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/'); }}>
        Wróć na stronę główną
      </a>
    </div>
  );
}
