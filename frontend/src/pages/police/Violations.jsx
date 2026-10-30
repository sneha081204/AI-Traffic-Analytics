import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Shield, Receipt, CheckCircle, Clock, XCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';

export const PoliceViolations = () => {
  const { user } = useAuth();
  const { violations } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredViolations = violations.filter((v) => {
    const isOfficerCase = !v.officerBadge || v.officerBadge === user?.badge || v.officerName === user?.name;
    const matchesSearch =
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violationType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || v.violationType === typeFilter;
    return isOfficerCase && matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            My Enforcement Violations
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            All cases captured, verified, and issued by {user?.name ? `Officer ${user.name}` : 'Enforcement Officer'}
          </p>
        </div>

        {/* Filter Controls & Manual Action */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/police/capture?tab=manual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            }}
          >
            <PlusCircle size={15} />
            <span>Manual Entry</span>
          </button>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search plate / case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontWeight: 600,
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Fine Generated">Fine Generated</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Case ID</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Date & Time</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Vehicle Type</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Plate Number</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Violation Offence</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Fine</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.length > 0 ? (
                filteredViolations.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0F172A' }}>
                      {v.id}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>
                      <div>{v.time}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{v.date}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#334155' }}>
                      {v.vehicleType}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <PlateBadge plate={v.vehicleNumber} size="sm" />
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {v.violationType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#0F172A' }}>
                      ₹{v.fineAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor:
                            v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid'
                              ? '#DCFCE7'
                              : '#FEF3C7',
                          color:
                            v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid'
                              ? '#15803D'
                              : '#B45309',
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/police/violations/${v.id}`)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#2563EB',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Eye size={13} /> View Case
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                    No violation cases found matching the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
