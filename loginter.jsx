import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateField, submitInteractionText, clearForm } from '../store/crmSlice';

export default function LogInteractionScreen() {
  const dispatch = useDispatch();

  const { formData, complianceStatus, loading, aiFeedback, missingFields } = useSelector((state) => state.crm);

  const [activeTab, setActiveTab] = useState('chat');
  const [conversationalInput, setConversationalInput] = useState('');

  const handleInputChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleAIProcess = (e) => {
    e.preventDefault();
    if (!conversationalInput.trim()) return;
    dispatch(submitInteractionText(conversationalInput));
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc',
      padding: '2.5rem 1.5rem',
      minHeight: '100vh',
      color: '#1e293b'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            HCP Log Interaction Screen
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Life Sciences Commercial Enforcement Engine — Multi-Agent Dictation Processing
          </p>
        </header>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: '#e2e8f0', padding: '0.35rem', borderRadius: '0.5rem', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.375rem', border: 'none', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', backgroundColor: activeTab === 'chat' ? '#ffffff' : 'transparent',
              color: activeTab === 'chat' ? '#2563eb' : '#475569', boxShadow: activeTab === 'chat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}>
            Conversational Agent Input
          </button>
          <button
            onClick={() => setActiveTab('form')}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.375rem', border: 'none', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', backgroundColor: activeTab === 'form' ? '#ffffff' : 'transparent',
              color: activeTab === 'form' ? '#2563eb' : '#475569', boxShadow: activeTab === 'form' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}>
            Structured Direct Form
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          <main style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
            {activeTab === 'chat' ? (
              <div>
                <form onSubmit={handleAIProcess}>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#334155' }}>
                    Record Transcript or Input Interaction Dictation
                  </label>
                  <textarea
                    rows={7}
                    value={conversationalInput}
                    onChange={(e) => setConversationalInput(e.target.value)}
                    placeholder="Provide details about the interaction. For example: Met Dr. Sarah Jenkins (HCP-701) to review CardioVance. We reviewed the phase 3 trials. Left 10 sample kits. Scheduled a follow-up medical briefing for next Tuesday..."
                    style={{
                      width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1',
                      fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box',
                      outline: 'none', transition: 'border-color 0.2s'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1, padding: '0.875rem', backgroundColor: '#2563eb', color: 'white',
                        border: 'none', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s'
                      }}>
                      {loading ? 'Orchestrating Models via Groq Engine...' : 'Submit to AI Agent Pipeline'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { dispatch(clearForm()); setConversationalInput(''); }}
                      style={{ padding: '0.875rem 1.25rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#334155' }}>Verify Form Attributes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>HCP Reference Key</label>
                    <input type="text" value={formData.hcp_id || ''} onChange={(e) => handleInputChange('hcp_id', e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Product Focus</label>
                    <input type="text" value={formData.product_discussed || ''} onChange={(e) => handleInputChange('product_discussed', e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Engagement Modality Channel</label>
                  <input type="text" value={formData.interaction_type || ''} onChange={(e) => handleInputChange('interaction_type', e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Discussion Insights & Medical Queries</label>
                  <textarea rows={4} value={formData.key_insights || ''} onChange={(e) => handleInputChange('key_insights', e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Samples</label>
                    <input type="number" value={formData.samples_dropped || 0} onChange={(e) => handleInputChange('samples_dropped', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Follow-Up Requirements</label>
                    <input type="text" value={formData.follow_up_action || ''} onChange={(e) => handleInputChange('follow_up_action', e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <button
                  onClick={() => alert('Interaction updated manually inside the relational system state.')}
                  style={{ padding: '0.875rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Commit Form Logs
                </button>
              </div>
            )}

            {aiFeedback && (
              <div style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '0.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', fontSize: '0.925rem', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', fontWeight: 700, color: '#0369a1', marginBottom: '0.25rem' }}>Pipeline Response:</div>
                <div style={{ color: '#0c4a6e' }}>{aiFeedback}</div>
              </div>
            )}
          </main>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              borderTop: `5px solid ${complianceStatus.is_compliant ? '#10b981' : '#ef4444'}`
            }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                Compliance Evaluation
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '0.775rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '1rem',
                  backgroundColor: complianceStatus.is_compliant ? '#d1fae5' : '#fee2e2',
                  color: complianceStatus.is_compliant ? '#065f46' : '#991b1b'
                }}>
                  {complianceStatus.is_compliant ? 'CLEAR' : 'COMPLIANCE FLAG DETECTED'}
                </span>
                {complianceStatus.risk_score > 0 && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    Risk Index: {complianceStatus.risk_score}/100
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: '1.45' }}>
                {complianceStatus.justification || 'No real-time execution report logged yet.'}
              </p>
            </div>

            {missingFields.length > 0 && (
              <div style={{ backgroundColor: '#fffbeb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #fef3c7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#92400e', fontWeight: 700, fontSize: '0.95rem' }}>
                  Missing Struct Fields
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {missingFields.map((field) => (
                    <span key={field} style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                      {field.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
