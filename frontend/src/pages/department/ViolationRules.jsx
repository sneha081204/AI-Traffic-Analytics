import React, { useState } from 'react';
import { Scale, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DepartmentViolationRules = () => {
  const { violationRules, addRule, updateRule, deleteRule } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    fine: 1000,
    severity: 'HIGH',
    ruleSection: 'Section 177 Motor Vehicles Act',
    status: 'Active',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRule.name) return;
    addRule(newRule);
    setShowAddModal(false);
    setNewRule({
      name: '',
      description: '',
      fine: 1000,
      severity: 'HIGH',
      ruleSection: 'Section 177 Motor Vehicles Act',
      status: 'Active',
    });
  };

  const handleToggleStatus = (id, currentStatus) => {
    updateRule(id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Traffic Violation Rules & Statutory Fine Engine
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.35rem 0 0 0' }}>
            Configure legal penalties, Motor Vehicle Act sections, and offence severity applied by the AI system
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.15rem',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <Plus size={16} />
          <span>Add Violation Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div
        className="card table-container"
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.9)', color: '#475569', textAlign: 'left', backgroundColor: 'rgba(241, 245, 249, 0.85)' }}>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Rule Code</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Violation Offence</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Description</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Statutory Section</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Fine (₹)</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Severity</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {violationRules.map((rule) => (
                <tr 
                  key={rule.id} 
                  style={{ borderBottom: '1px solid rgba(241, 245, 249, 0.9)', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {rule.id}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#2563EB' }}>
                    {rule.name}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#64748B', fontSize: '0.82rem', maxWidth: '280px' }}>
                    {rule.description}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#334155', fontWeight: 600, fontSize: '0.78rem' }}>
                    {rule.ruleSection}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    ₹{rule.fine?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor:
                          rule.severity === 'CRITICAL'
                            ? '#FEF2F2'
                            : rule.severity === 'HIGH'
                            ? '#FFFBEB'
                            : '#EFF6FF',
                        color:
                          rule.severity === 'CRITICAL'
                            ? '#DC2626'
                            : rule.severity === 'HIGH'
                            ? '#B45309'
                            : '#2563EB',
                        border:
                          rule.severity === 'CRITICAL'
                            ? '1px solid #FECACA'
                            : rule.severity === 'HIGH'
                            ? '1px solid #FDE68A'
                            : '1px solid #BFDBFE',
                      }}
                    >
                      {rule.severity}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: rule.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                        color: rule.status === 'Active' ? '#15803D' : '#64748B',
                        border: rule.status === 'Active' ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                      }}
                    >
                      {rule.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleToggleStatus(rule.id, rule.status)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(203, 213, 225, 0.8)',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#94A3B8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)';
                        }}
                      >
                        {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
              color: '#0F172A',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
                Add New Traffic Violation Rule
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>Offence Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized U-Turn"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Executing U-Turn on non-designated junction"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>Fine Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newRule.fine}
                    onChange={(e) => setNewRule({ ...newRule, fine: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFFFFF', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>Applicable Statutory Section</label>
                <input
                  type="text"
                  value={newRule.ruleSection}
                  onChange={(e) => setNewRule({ ...newRule, ruleSection: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.35rem', borderRadius: '8px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)' }}
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentViolationRules;
