import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { APPLICATIONS, formatDateTime } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { navigate } from '../utils/router';

interface Application {
  id: string;
  name: string;
  headline: string;
  submitted: string;
  kyc: 'zweryfikowano' | 'oczekuje' | 'niezgodnosc';
  linkedin: boolean;
  hue: number;
  categories: string[];
}

export function A1Verification() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'submitted' | 'changes_requested' | 'approved' | 'rejected'>('all');
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [decision, setDecision] = useState<'approve' | 'changes' | 'reject'>('approve');
  const [decisionFields, setDecisionFields] = useState<string[]>([]);
  const [decisionComment, setDecisionComment] = useState('');

  const filteredApps = APPLICATIONS.filter((app) => 
    filter === 'all' || 
    (filter === 'submitted' && app.kyc === 'oczekuje') ||
    (filter === 'changes_requested' && app.kyc === 'niezgodnosc') ||
    (filter === 'approved' && app.kyc === 'zweryfikowano') ||
    (filter === 'rejected' && app.kyc === 'odrzucony')
  );

  const handleDecision = (appId: string, decisionType: 'approve' | 'changes' | 'reject') => {
    setEditingApplication(APPLICATIONS.find(a => a.id === appId) as Application || null);
    setDecision(decisionType);
    setDecisionFields([]);
    setDecisionComment('');
  };

  const confirmDecision = () => {
    if (!editingApplication) return;
    if (decision === 'changes' && decisionFields.length === 0) {
      addToast('Wybierz co najmniej 1 pole do poprawy', 'error');
      return;
    }
    if ((decision === 'changes' || decision === 'reject') && !decisionComment.trim()) {
      addToast('Wpisz uzasadnienie', 'error');
      return;
    }
    
    const action = decision === 'approve' ? 'zatwierdzono' : decision === 'changes' ? 'poproszono o zmiany' : 'odrzucono';
    addToast(`Wniosek ${editingApplication.name} ${action} (symulacja)`, 'success');
    setEditingApplication(null);
    setDecisionComment('');
    setDecisionFields([]);
  };

  const kycStatusLabels: Record<string, { label: string; class: string }> = {
    zweryfikowano: { label: 'Zweryfikowano', class: 'badge--success' },
    oczekuje: { label: 'Oczekuje na KYC', class: 'badge--warning' },
    niezgodnosc: { label: 'Niezgodność danych', class: 'badge--danger' },
  };

  const getKycLabel = (kyc: string) => kycStatusLabels[kyc as keyof typeof kycStatusLabels]?.label || kyc;
  const getKycClass = (kyc: string) => kycStatusLabels[kyc as keyof typeof kycStatusLabels]?.class || 'badge--neutral';

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="type-page-title font-serif">Weryfikacja mentorów</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'submitted', 'changes_requested', 'approved', 'rejected'] as const).map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn--primary' : 'btn--ghost'} btn--s`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Wszystkie' : f === 'submitted' ? 'Nowe' : f === 'changes_requested' ? 'Poprawki' : f === 'approved' ? 'Zatwierdzone' : 'Odrzucone'}
              <span className="count">{APPLICATIONS.filter(a => f === 'all' || (f === 'submitted' && a.kyc === 'oczekuje') || (f === 'changes_requested' && a.kyc === 'niezgodnosc') || (f === 'approved' && a.kyc === 'zweryfikowano') || (f === 'rejected' && a.kyc === 'odrzucony')).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Queue table */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Kategoria</th>
                  <th>Zgłoszono</th>
                  <th>Wiek (dni)</th>
                  <th>KYC</th>
                  <th>LinkedIn</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => {
                  const submittedDate = new Date(app.submitted);
                  const ageDays = Math.floor((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={app.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar" style={{ '--h': app.hue, '--s': '32px' }} aria-hidden="true">{app.name[0]}</div>
                          <strong>{app.name}</strong>
                        </div>
                      </td>
                      <td>{app.categories.join(', ')}</td>
                      <td>{formatDateTime(app.submitted, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td>{ageDays} dni</td>
                      <td><span className={`badge ${getKycClass(app.kyc)}`}>{getKycLabel(app.kyc)}</span></td>
                      <td>{app.linkedin ? <span className="badge badge--success">✓ Podłączony</span> : <span className="badge badge--danger">Brak</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn--primary btn--s" onClick={() => handleDecision(app.id, 'approve')}>Zatwierdź</button>
                        <button className="btn btn--secondary btn--s" onClick={() => handleDecision(app.id, 'changes')}>Poprawki</button>
                        <button className="btn btn--danger btn--s" onClick={() => handleDecision(app.id, 'reject')}>Odrzuć</button>
                      </td>
                    </tr>
                  )}
              )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Application detail modal */}
      {editingApplication && (
        <div className="modal-backdrop" onClick={() => setEditingApplication(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px', maxHeight: '90vh', overflow: 'auto' }}>
            <button className="modal__close" onClick={() => setEditingApplication(null)} aria-label="Zamknij">×</button>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div className="avatar" style={{ '--h': editingApplication.hue, '--s': '56px' }} aria-hidden="true">{editingApplication.name[0]}</div>
                <div>
                  <h2 className="type-page-title font-serif" style={{ marginBottom: '0.5rem' }}>{editingApplication.name}</h2>
                  <p className="text-muted">{editingApplication.headline}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 className="type-label" style={{ marginBottom: '8px' }}>Kategorie</h3>
                  <div className="tags">{editingApplication.categories.map(c => <span key={c} className="tag">{c}</span>)}</div>
                </div>
                <div>
                  <h3 className="type-label" style={{ marginBottom: '8px' }}>LinkedIn</h3>
                  <p>{editingApplication.linkedin ? <a href={editingApplication.linkedin} target="_blank" rel="noopener" className="link">Zobacz profil</a> : <span className="text-muted">Brak</span>}</p>
                </div>
                <div>
                  <h3 className="type-label" style={{ marginBottom: '8px' }}>Status KYC</h3>
                  <span className={`badge ${getKycClass(editingApplication.kyc)}`}>{getKycLabel(editingApplication.kyc)}</span>
                </div>
                <div>
                  <h3 className="type-label" style={{ marginBottom: '8px' }}>Zgłoszono</h3>
                  <p>{formatDateTime(editingApplication.submitted, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {/* Decision form */}
              <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: '1.5rem' }}>
                <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Decyzja</h3>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  {(['approve', 'changes', 'reject'] as const).map(d => (
                    <button key={d} className={`btn ${decision === d ? 'btn--primary' : d === 'reject' ? 'btn--danger' : 'btn--secondary'}`} onClick={() => { setDecision(d); setDecisionFields([]); setDecisionComment(''); }}>
                      {d === 'approve' ? 'Zatwierdź' : d === 'changes' ? 'Poproś o zmiany' : 'Odrzuć'}
                    </button>
                  ))}
                </div>

                {decision === 'changes' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="type-label" style={{ marginBottom: '8px' }}>Pola do poprawy (min. 1)</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['Dane osobowe', 'LinkedIn', 'Dokument tożsamości', 'IBAN', 'NIP/TIN', 'Opis profilu', 'Stawka', 'Dostępność'].map(field => (
                        <label key={field} className="chip" style={{ background: decisionFields.includes(field) ? 'var(--selected-bg)' : 'var(--surface-panel)', borderColor: decisionFields.includes(field) ? 'var(--selected-border)' : 'var(--border-divider)', color: decisionFields.includes(field) ? 'var(--selected-border)' : 'var(--text-default)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={decisionFields.includes(field)} onChange={e => setDecisionFields(prev => e.target.checked ? [...prev, field] : prev.filter(f => f !== field))} style={{ marginRight: '6px' }} />
                          {field}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {decision === 'reject' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="type-label" style={{ marginBottom: '8px' }}>Powód odrzucenia</h4>
                    <select className="input" style={{ maxWidth: '320px', marginBottom: '8px' }} value={decisionComment} onChange={e => setDecisionComment(e.target.value)}>
                      <option value="">Wybierz powód</option>
                      <option value="niekompletne_dane">Niekompletne dane</option>
                      <option value="niezgodnosc_kyc">Niezgodność KYC</option>
                      <option value="falszywy_profil">Podejrzenie fałszowego profilu</option>
                      <option value="inny">Inny</option>
                    </select>
                    {decisionComment === 'inny' && (
                      <textarea className="textarea" rows={3} placeholder="Wpisz własny powód..." value={decisionComment} onChange={e => setDecisionComment(e.target.value)} />
                    )}
                  </div>
                )}

                {(decision === 'changes' || decision === 'reject') && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="type-label" style={{ marginBottom: '8px' }}>Komentarz / uzasadnienie <span style={{ color: 'var(--status-danger-fg)' }}>*</span></h4>
                    <textarea className="textarea" rows={3} placeholder="Uzasadnij decyzję (min. 20 znaków)..." value={decisionComment} onChange={e => setDecisionComment(e.target.value)} minLength={20} />
                    {decisionComment.length > 0 && decisionComment.length < 20 && <p className="text-status-danger" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Min. 20 znaków</p>}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn btn--ghost" onClick={() => setEditingApplication(null)}>Anuluj</button>
                  <button className={`btn ${decision === 'reject' ? 'btn--danger' : 'btn--primary'}`} onClick={confirmDecision} disabled={(decision === 'changes' && (decisionFields.length === 0 || decisionComment.length < 20)) || (decision === 'reject' && decisionComment.length < 20)}>
                    {decision === 'approve' ? 'Zatwierdź' : decision === 'changes' ? 'Wyślij poprawki' : 'Odrzuć'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const handleDecision = (appId: string, decisionType: 'approve' | 'changes' | 'reject') => {
  // This is a placeholder - the actual handler is defined in the component
  console.log('handleDecision', appId, decisionType);
};