import React, { useState } from 'react';
import { Receipt, Search, Download, CheckCircle2, Clock, FileSpreadsheet, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';

export const DepartmentFines = () => {
  const { violations } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const totalAssessed = violations.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  const paidList = violations.filter((v) => v.paymentStatus === 'Paid');
  const paidAmount = paidList.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  const pendingAmount = totalAssessed - paidAmount;

  const filteredViolations = violations.filter(
    (v) =>
      !searchTerm ||
      v.challanNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.officerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── EXCEL EXPORT ──
  const handleExportExcel = () => {
    const headers = [
      'Challan No',
      'Case ID',
      'Date',
      'Time',
      'Vehicle Plate',
      'Offence',
      'Fine Amount (INR)',
      'Payment Status',
      'Enforcing Officer',
      'Sector Location'
    ];
    const rows = filteredViolations.map((v) => [
      `"${v.challanNo || 'N/A'}"`,
      `"${v.id || ''}"`,
      `"${v.date || ''}"`,
      `"${v.time || ''}"`,
      `"${v.vehicleNumber || ''}"`,
      `"${v.violationType || ''}"`,
      v.fineAmount || 0,
      `"${v.paymentStatus || 'Pending'}"`,
      `"${v.officerName || 'Traffic Unit'}"`,
      `"${v.location || 'Metropolitan Sector'}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Department_Revenue_Fines_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── PDF EXPORT ──
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const rowsHtml = filteredViolations
      .map(
        (v, i) => `
        <tr style="background-color: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
          <td style="padding: 7px 9px; font-family: monospace; font-weight: 800; color: #2563EB; font-size: 11px;">${v.challanNo || 'N/A'}</td>
          <td style="padding: 7px 9px; font-size: 11px;">${v.date}</td>
          <td style="padding: 7px 9px; font-family: monospace; font-weight: 700; font-size: 11px;">${v.vehicleNumber}</td>
          <td style="padding: 7px 9px; font-weight: 700; color: #DC2626; font-size: 11px;">${v.violationType}</td>
          <td style="padding: 7px 9px; font-size: 11px; color: #334155;">${v.officerName}</td>
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
        <title>Department Revenue & Fine Ledger</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; margin: 0; padding: 12px; }
          .header { border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #0F172A; color: #FFFFFF; font-size: 10px; text-align: left; padding: 8px 9px; }
          td { border-bottom: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2 style="margin:0;">DEPARTMENT COMMAND HEADQUARTERS</h2>
            <div style="font-size:12px; color:#475569;">CENTRAL TRAFFIC REVENUE & FINE LEDGER</div>
          </div>
          <div style="text-align:right; font-size:11px;">
            <div>Audit Date: <strong>${reportDate}</strong></div>
            <div style="color:#059669; font-weight:700;">● TREASURY VERIFIED</div>
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-bottom:14px;">
          <div style="background:#F8FAFC; padding:8px 14px; border-radius:6px; border:1px solid #E2E8F0;">TOTAL LEVIED: <strong>₹${totalAssessed.toLocaleString('en-IN')}</strong></div>
          <div style="background:#F0FDF4; padding:8px 14px; border-radius:6px; border:1px solid #BBF7D0; color:#15803D;">COLLECTED: <strong>₹${paidAmount.toLocaleString('en-IN')}</strong></div>
          <div style="background:#FFFBEB; padding:8px 14px; border-radius:6px; border:1px solid #FED7AA; color:#B45309;">PENDING DUES: <strong>₹${pendingAmount.toLocaleString('en-IN')}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>CHALLAN NO</th>
              <th>DATE</th>
              <th>VEHICLE PLATE</th>
              <th>OFFENCE</th>
              <th>OFFICER</th>
              <th>FINE (₹)</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Department Revenue & Fine Ledger
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            System-wide e-Challan penalty collections, statutory fines, and payment settlement audit
          </p>
        </div>

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
            }}
          >
            <FileText size={15} color="#60A5FA" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Revenue KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TOTAL PENALTIES LEVIED</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
            ₹{totalAssessed.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
            Across all active enforcement sectors
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 600 }}>COLLECTED & SETTLED</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16A34A', marginTop: '0.2rem' }}>
            ₹{paidAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '0.1rem' }}>{paidList.length} Paid challans</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 600 }}>PENDING OUTSTANDING</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D97706', marginTop: '0.2rem' }}>
            ₹{pendingAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '0.1rem' }}>Awaiting citizen payment</div>
        </div>
      </div>

      {/* Challan Table */}
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
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Challan No</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Vehicle Plate</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Offence</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Officer</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Amount (₹)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#2563EB' }}>{v.challanNo}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>{v.date}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <PlateBadge plate={v.vehicleNumber} size="sm" />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#DC2626' }}>{v.violationType}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#334155' }}>{v.officerName}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 900, color: '#0F172A' }}>₹{v.fineAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: v.paymentStatus === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                        color: v.paymentStatus === 'Paid' ? '#15803D' : '#B45309',
                      }}
                    >
                      {v.paymentStatus || 'Pending'}
                    </span>
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
