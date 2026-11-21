import React from 'react';
import { navigate } from '../utils/router';

export function U7Review() {
  return (
    <div className="screen-enter">
      <h1 className="type-page-title font-serif">U7Review</h1>
      <p className="text-muted" style={{ marginTop: '1rem' }}>Ekran w budowie</p>
      <a href="#/" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/'); }}>
        Wróć na stronę główną
      </a>
    </div>
  );
}
