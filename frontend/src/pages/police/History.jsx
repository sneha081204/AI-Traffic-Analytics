import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Filter, 
  Search, 
  Calendar, 
  MapPin, 
  Eye, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2,
  Shield,
  Clock,
  Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';

export const PoliceHistory = () => {
  const { user } = useAuth();
  const { violations } = useApp();
  const navigate = useNavigate();

  const [filterSource, setFilterSource] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const historyList = violations.filter((v) => {
    const isMyCase = !v.officerBadge || v.officerBadge === user?.badge || v.officerName === user?.name;
    const matchesSource = filterSource === 'ALL' || v.detectionMethod?.toLowerCase().includes(filterSource.toLowerCase());
    const matchesSearch = !searchTerm ||
      v.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase());

    return isMyCase && matchesSource && matchesSearch;
  });

  const totalFine = historyList.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  const verifiedCases = historyList.filter((v) => v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid').length;

  // ── EXCEL (.CSV) EXPORT ──
  const handleExportExcel = () => {
    const headers = [
      'Case ID',
      'Date',
      'Time',
      'Officer Name',
      'Badge Number',
      'Assigned Sector',
      'Vehicle Plate Number',
      'Vehicle Type',
      'Violation Offence',
      'Fine Amount (INR)',
      'Evidence Source',
      'Enforcement Location',
      'AI Confidence Score (%)',
      'Case Status',
      'Challan Reference Number',
      'Payment Status'
    ];

    const rows = historyList.map((v) => [
      `"${v.id || ''}"`,
      `"${v.date || ''}"`,
      `"${v.time || ''}"`,
      `"${user?.name || v.officerName || 'Traffic Officer'}"`,
      `"${user?.badge || v.officerBadge || 'TP-8108'}"`,
      `"${v.zone || user?.assignedArea || 'Patrol Sector'}"`,
      `"${v.vehicleNumber || ''}"`,
      `"${v.vehicleType || 'Motorcycle'}"`,
      `"${v.violationType || ''}"`,
      v.fineAmount || 0,
      `"${v.detectionMethod || 'AI Vision Camera'}"`,
      `"${v.location || 'Metropolitan Corridor'}"`,
      `"${((v.confidence || 0.95) * 100).toFixed(1)}%"`,
      `"${v.status || 'Verified'}"`,
      `"${v.challanNo || 'N/A'}"`,
      `"${v.paymentStatus || 'Pending'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Officer_Enforcement_History_${user?.badge || 'HQ'}_${new Date().toISOString().slice(0, 10)}.csv`);
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

    const rowsHtml = historyList
      .map(
        (v, i) => `
        <tr style="background-color: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
          <td style="padding: 7px 9px; font-family: monospace; font-weight: 700; font-size: 11px;">${v.id}</td>
          <td style="padding: 7px 9px; font-size: 11px;">${v.date} <span style="color:#64748B;">${v.time}</span></td>
          <td style="padding: 7px 9px; font-family: monospace; font-weight: 700; font-size: 11px;">${v.vehicleNumber}</td>
          <td style="padding: 7px 9px; font-weight: 700; color: #DC2626; font-size: 11px;">${v.violationType}</td>
          <td style="padding: 7px 9px; font-size: 11px; color: #475569;">${v.detectionMethod || 'AI Vision'}</td>
          <td style="padding: 7px 9px; font-size: 11px; color: #334155;">${v.location || 'Patrol Sector'}</td>
          <td style="padding: 7px 9px; font-weight: 800; font-size: 11px;">₹${(v.fineAmount || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 7px 9px; font-size: 11px; font-weight: 700; color: ${v.status === 'Paid' || v.status === 'Verified' ? '#15803D' : '#D97706'};">${v.status || 'Verified'}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Officer Enforcement History - ${user?.name || 'Officer'}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 12px; }
          .header { border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 900; color: #0F172A; letter-spacing: -0.02em; }
          .subtitle { font-size: 12px; color: #475569; margin-top: 3px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
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
            <div class="title">TRAFFIC POLICE DEPARTMENT</div>
            <div class="subtitle">OFFICER ENFORCEMENT DOSSIER & STATUTORY AUDIT REPORT</div>
            <div style="font-size: 11px; margin-top: 4px; color: #334155;">
              Officer: <strong>${user?.name || 'Enforcement Officer'}</strong> • Badge: <strong>${user?.badge || 'TP-8108'}</strong> • Area: <strong>${user?.assignedArea || 'Patrol Sector'}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #64748B;">GENERATION TIMESTAMP</div>
            <div style="font-size: 11px; font-weight: 700;">${reportDate}</div>
            <div style="font-size: 9px; color: #059669; font-weight: 800; margin-top: 3px;">● OFFICIAL DIGITAL RECORD</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">TOTAL VIOLATIONS CAPTURED</div>
            <div class="meta-value">${historyList.length} Cases</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">VERIFIED OFFENCES</div>
            <div class="meta-value" style="color: #15803D;">${verifiedCases}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">TOTAL PENALTIES ASSESSED</div>
            <div class="meta-value" style="color: #2563EB;">₹${totalFine.toLocaleString('en-IN')}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">PRIMARY SINK</div>
            <div class="meta-value" style="font-size: 13px;">Motor Vehicles Act</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>CASE ID</th>
              <th>TIMESTAMP</th>
              <th>PLATE NUMBER</th>
              <th>VIOLATION OFFENCE</th>
              <th>SOURCE</th>
              <th>LOCATION</th>
              <th>FINE (₹)</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>Report Hash: <code>${Math.random().toString(36).substring(2, 12).toUpperCase()}</code> • Smart City Traffic AI Matrix</div>
          <div>Page 1 of 1 • Official Police Field Record</div>
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
            Officer Enforcement History
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Historical timeline of all traffic violation detections, case outcomes, and statutory reports
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

      {/* Filter & Search Toolbar */}
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
            placeholder="Search by case ID, license plate, violation, location..."
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
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
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
            <option value="ALL">All Evidence Sources</option>
            <option value="Live Camera">Live Camera AI</option>
            <option value="Image">Uploaded Image</option>
            <option value="Video">Uploaded Video</option>
          </select>
        </div>
      </div>

      {/* History Table */}
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
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700, borderRadius: '6px 0 0 6px' }}>Case ID</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Timestamp</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Plate Number</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Violation Offence</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Evidence Source</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Enforcement Location</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Fine Amount</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700, textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No matching enforcement history found.
                  </td>
                </tr>
              ) : (
                historyList.map((v) => (
                  <tr 
                    key={v.id} 
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                      {v.id}
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
                      {v.detectionMethod || 'AI Camera'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.75rem', color: '#64748B' }}>
                      {v.location || 'Patrol Sector'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#0F172A' }}>
                      ₹{v.fineAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor:
                            v.status === 'Paid' || v.status === 'Verified' || v.status === 'Fine Generated'
                              ? '#DCFCE7'
                              : '#FEF3C7',
                          color:
                            v.status === 'Paid' || v.status === 'Verified' || v.status === 'Fine Generated'
                              ? '#15803D'
                              : '#B45309',
                          border:
                            v.status === 'Paid' || v.status === 'Verified' || v.status === 'Fine Generated'
                              ? '1px solid #BBF7D0'
                              : '1px solid #FDE68A',
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
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
                        <Eye size={13} /> View
                      </button>
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
export default PoliceHistory;
