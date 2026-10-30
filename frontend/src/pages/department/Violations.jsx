import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Search, Filter, Eye, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';

export const DepartmentViolations = () => {
  const { violations } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = violations.filter((v) => {
    const matchSearch =
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.officerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Central Traffic Violation Records Registry
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            System-wide repository of all traffic infractions, AI confidence scores, and officer actions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search plate / case ID / officer..."
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
          </select>
        </div>
      </div>

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
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Plate Number</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Offence Type</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Enforcing Officer</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Fine (₹)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0F172A' }}>{v.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>
                    <div>{v.date}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{v.time}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <PlateBadge plate={v.vehicleNumber} size="sm" />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#DC2626' }}>{v.violationType}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#334155', fontSize: '0.8rem' }}>
                    <div>{v.officerName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Badge: {v.officerBadge}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 900, color: '#0F172A' }}>₹{v.fineAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: v.status === 'Paid' || v.status === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                        color: v.status === 'Paid' || v.status === 'Verified' ? '#15803D' : '#B45309',
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
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
