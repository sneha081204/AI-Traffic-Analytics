import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Share2, 
  FileSpreadsheet, 
  FileText,
  AlertCircle,
  Coins
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';

export const PoliceFines = () => {
  const { user } = useAuth();
  const { violations, updateViolationStatus } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState('ALL');

  const challanList = violations.filter(
    (v) =>
      v.challanNo &&
      (!v.officerBadge || v.officerBadge === user?.badge || v.officerName === user?.name) &&
      (filterPaid === 'ALL' || v.paymentStatus === filterPaid) &&
      (!searchTerm ||
        v.challanNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.violationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ruleSection?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAssessed = challanList.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  const paidList = challanList.filter((v) => v.paymentStatus === 'Paid');
  const paidAmount = paidList.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  const pendingAmount = totalAssessed - paidAmount;

  const handleMarkPaid = (id) => {
    updateViolationStatus(id, 'Paid', { paymentStatus: 'Paid' });
  };

  // ── EXCEL (.CSV) EXPORT ──
  const handleExportExcel = () => {
    const headers = [
      'Challan Number',
      'Case ID',
      'Issued Date',
      'Issued Time',
      'Vehicle Plate Number',
      'Vehicle Class',
      'Statutory Offence',
      'Motor Vehicle Act Section',
      'Fine Amount (INR)',
      'Payment Status',
      'Enforcement Officer',
      'Badge Number',
      'Patrol Jurisdiction'
    ];

    const rows = challanList.map((v) => [
      `"${v.challanNo || ''}"`,
      `"${v.id || ''}"`,
      `"${v.date || ''}"`,
      `"${v.time || ''}"`,
      `"${v.vehicleNumber || ''}"`,
      `"${v.vehicleType || 'Motorcycle'}"`,
      `"${v.violationType || ''}"`,
      `"${v.ruleSection || 'Section 129 MVA 1988'}"`,
      v.fineAmount || 0,
      `"${v.paymentStatus || 'Pending'}"`,
      `"${user?.name || v.officerName || 'Traffic Police Officer'}"`,
      `"${user?.badge || v.officerBadge || 'TP-8108'}"`,
      `"${v.zone || user?.assignedArea || 'Patrol Sector'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Police_eChallans_Report_${user?.badge || 'HQ'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── OFFICIAL PDF REPORT EXPORT ──
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up window blocked. Please allow pop-ups for this site to generate the PDF.');
      return;
    }

    const reportDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const rowsHtml = challanList
      .map(
        (v, i) => `
        <tr style="background-color: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
          <td style="padding: 7px 9px; font-family: monospace; font-weight: 800; color: #2563EB; font-size: 11px;">${v.challanNo}</td>
          <td style="padding: 7px 9px; font-size: 11px;">${v.date} <span style="color:#64748B;">${v.time}</span></td>
          <td style="padding: 7px 9px; font-family: monospace; font-weight: 700; font-size: 11px;">${v.vehicleNumber}</td>
          <td style="padding: 7px 9px; font-weight: 700; color: #DC2626; font-size: 11px;">${v.violationType}</td>
          <td style="padding: 7px 9px; font-size: 10px; color: #475569;">${v.ruleSection || 'Sec 129 MVA'}</td>
          <td style="padding: 7px 9px; font-weight: 800; font-size: 11px;">₹${(v.fineAmount || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 7px 9px; font-size: 11px; font-weight: 800; color: ${v.paymentStatus === 'Paid' ? '#15803D' : '#D97706'};">${v.paymentStatus || 'Pending'}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>e-Challan & Digital Fines Audit Report - ${user?.name || 'Officer'}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 12px; }
          .header { border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 900; color: #0F172A; letter-spacing: -0.02em; }
          .subtitle { font-size: 12px; color: #475569; margin-top: 3px; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
          .meta-card { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px; }
          .meta-label { font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; }
          .meta-value { font-size: 16px; font-weight: 800; color: #0F172A; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #0F172A; color: #FFFFFF; font-size: 10px; font-weight: 700; text-align: left; padding: 8px 9px; }
          td { border-bottom: 1px solid #E2E8F0; }
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #CBD5E1; display: flex; justify-content: space-between; font-size: 10px; color: #64748B; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">TRAFFIC ENFORCEMENT & e-CHALLAN REVENUE DIRECTORY</div>
            <div class="subtitle">STATUTORY MOTOR VEHICLE ACT 1988 PENALTY REGISTER</div>
            <div style="font-size: 11px; margin-top: 4px; color: #334155;">
              Issuing Authority: <strong>${user?.name || 'Traffic Police Officer'}</strong> • Badge: <strong>${user?.badge || 'TP-8108'}</strong> • Division: <strong>${user?.assignedArea || 'Patrol Sector'}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #64748B;">AUDIT TIMESTAMP</div>
            <div style="font-size: 11px; font-weight: 700;">${reportDate}</div>
            <div style="font-size: 9px; color: #059669; font-weight: 800; margin-top: 3px;">● STATUTORY e-GOVERNANCE SEAL</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">TOTAL CHALLANS ASSESSED</div>
            <div class="meta-value">₹${totalAssessed.toLocaleString('en-IN')} <span style="font-size: 11px; color: #64748B;">(${challanList.length} items)</span></div>
          </div>
          <div class="meta-card">
            <div class="meta-label">SETTLED & COLLECTED</div>
            <div class="meta-value" style="color: #15803D;">₹${paidAmount.toLocaleString('en-IN')} <span style="font-size: 11px; color: #15803D;">(${paidList.length} Paid)</span></div>
          </div>
          <div class="meta-card">
            <div class="meta-label">PENDING REVENUE DUE</div>
            <div class="meta-value" style="color: #D97706;">₹${pendingAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>CHALLAN NO</th>
              <th>ISSUED DATE</th>
              <th>VEHICLE PLATE</th>
              <th>STATUTORY OFFENCE</th>
              <th>LEGAL SECTION</th>
              <th>FINE (₹)</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>Authentication ID: <code>${Math.random().toString(36).substring(2, 12).toUpperCase()}</code> • Certified Police e-Challan Registry</div>
          <div>Page 1 of 1 • Statutory Government Record</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* Page Header with Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Issued e-Challans & Digital Fines
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Statutory challan records generated under Motor Vehicles Act enforcement
          </p>
        </div>

        {/* Action Controls & Report Download Buttons */}
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <button
            onClick={handleExportExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #10B981',
              color: '#059669',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ECFDF5';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel (.csv)</span>
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#0F172A',
              border: '1px solid #0F172A',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0F172A';
              e.currentTarget.style.borderColor = '#0F172A';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FileText size={15} color="#60A5FA" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Revenue KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.15rem 1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL CHALLANS ASSESSED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
            ₹{totalAssessed.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
            {challanList.length} statutory enforcement records
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #BBF7D0', padding: '1.15rem 1.25rem', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.05)', background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
          <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 800, textTransform: 'uppercase' }}>COLLECTED & SETTLED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16A34A', marginTop: '0.2rem' }}>
            ₹{paidAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '0.15rem' }}>
            {paidList.length} paid cases settled
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #FED7AA', padding: '1.15rem 1.25rem', boxShadow: '0 2px 4px rgba(217, 119, 6, 0.05)', background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)' }}>
          <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>PENDING CITIZEN DUES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D97706', marginTop: '0.2rem' }}>
            ₹{pendingAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '0.15rem' }}>
            {challanList.length - paidList.length} awaiting settlement
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '0.85rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1', minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search by challan #, license plate, offence, legal section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={filterPaid}
            onChange={(e) => setFilterPaid(e.target.value)}
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
            <option value="ALL">All Payment Statuses</option>
            <option value="Pending">Payment Pending</option>
            <option value="Paid">Marked as Paid</option>
          </select>
        </div>
      </div>

      {/* Challan Ledger Table */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700, borderRadius: '6px 0 0 6px' }}>Challan No</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Issued Date</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Vehicle Plate</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Statutory Offence</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Legal Section</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Fine Amount</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Payment Status</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700, textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challanList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No matching e-Challan records found.
                  </td>
                </tr>
              ) : (
                challanList.map((v) => (
                  <tr 
                    key={v.id} 
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
                      {v.challanNo}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', color: '#64748B' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{v.date}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{v.time}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <PlateBadge plate={v.vehicleNumber} size="sm" />
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#DC2626' }}>
                      {v.violationType}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.75rem', color: '#475569' }}>
                      {v.ruleSection || 'Section 129 MVA'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 900, color: '#0F172A', fontSize: '0.9rem' }}>
                      ₹{v.fineAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: v.paymentStatus === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                          color: v.paymentStatus === 'Paid' ? '#15803D' : '#B45309',
                          border: v.paymentStatus === 'Paid' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                        }}
                      >
                        {v.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        {v.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleMarkPaid(v.id)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              color: '#15803D',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DCFCE7')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/police/violations/${v.id}`)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#2563EB',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563EB';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#EFF6FF';
                            e.currentTarget.style.color = '#2563EB';
                          }}
                        >
                          <Printer size={12} />
                          <span>Challan Dossier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default PoliceFines;
