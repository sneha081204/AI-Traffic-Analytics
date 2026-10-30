import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Shield,
  Flame,
  Coins,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ROUTES } from '../../config/routes';

export const DepartmentDashboard = () => {
  const { user, switchPortal } = useAuth();
  const { officers, violations, sectors, violationRules, aiConfig } = useApp();
  const navigate = useNavigate();

  // Real-time clock for command center
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  React.useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOfficersCount = officers.filter((o) => o.status === 'Active').length;
  const totalFineAmount = violations.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
  const paidFines = violations.filter((v) => v.paymentStatus === 'Paid' || v.status === 'Paid').length;
  const pendingCases = violations.filter((v) => v.status === 'Pending Verification' || v.status === 'Pending').length;
  const verifiedCases = violations.filter((v) => v.status === 'Verified' || v.status === 'Challan Issued' || v.status === 'Fine Generated' || v.status === 'Paid').length;

  // Sector congestion summary
  const sectorSummary = useMemo(() => {
    const map = {};
    officers.forEach((o) => {
      const area = o.assignedArea || 'Metropolitan Patrol Zone';
      if (!map[area]) {
        map[area] = { zone: area, cases: 0, fineAmount: 0 };
      }
    });

    violations.forEach((v) => {
      const loc = v.location || v.zone || 'Metropolitan Patrol Zone';
      if (!map[loc]) {
        map[loc] = { zone: loc, cases: 0, fineAmount: 0 };
      }
      map[loc].cases += 1;
      map[loc].fineAmount += (v.fineAmount || 0);
    });

    const entries = Object.values(map);
    if (entries.length === 0) return [];

    const maxCases = Math.max(...entries.map(e => e.cases), 1);

    return entries.map((z) => {
      let risk = 'CLEAR TRANSIT';
      let color = '#10B981';
      let bg = '#ECFDF5';
      let border = '#A7F3D0';

      if (z.cases >= 10) {
        risk = 'HIGH CONGESTION';
        color = '#EF4444';
        bg = '#FEF2F2';
        border = '#FECACA';
      } else if (z.cases >= 5) {
        risk = 'MODERATE PEAK';
        color = '#F59E0B';
        bg = '#FFFBEB';
        border = '#FDE68A';
      } else if (z.cases > 0) {
        risk = 'ACTIVE PATROL';
        color = '#2563EB';
        bg = '#EFF6FF';
        border = '#BFDBFE';
      }

      return {
        zone: z.zone,
        risk,
        cases: z.cases,
        fine: `₹${z.fineAmount.toLocaleString('en-IN')}`,
        color,
        bg,
        border,
        densityPct: Math.min(100, Math.round((z.cases / maxCases) * 100)),
      };
    }).sort((a, b) => b.cases - a.cases);
  }, [officers, violations]);

  const uniqueZonesCount = sectorSummary.length || 1;

  // KPIs
  const kpis = [
    { 
      title: 'Enrolled Police Officers', 
      value: officers.length, 
      sub: `${activeOfficersCount} Units On-Duty Now`, 
      portal: 'Police Field Portal',
      icon: Users, 
      color: '#2563EB', 
      glow: 'rgba(37,99,235,0.15)',
      gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
      lightBg: '#EFF6FF',
      borderColor: '#DBEAFE',
      pct: officers.length > 0 ? Math.round((activeOfficersCount / officers.length) * 100) : 85,
      path: ROUTES.DEPARTMENT.OFFICERS
    },
    { 
      title: 'Violations Captured (AI)', 
      value: violations.length, 
      sub: `Across ${uniqueZonesCount} Monitored Sectors`, 
      portal: 'Police & AI Feeds',
      icon: FileCheck, 
      color: '#EF4444', 
      glow: 'rgba(239,68,68,0.15)',
      gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
      lightBg: '#FEF2F2',
      borderColor: '#FEE2E2',
      pct: 94,
      path: ROUTES.DEPARTMENT.VIOLATIONS
    },
    { 
      title: 'Total Fines Assessed', 
      value: `₹${totalFineAmount.toLocaleString('en-IN')}`, 
      sub: `${paidFines} Cases Paid / Settled`, 
      portal: 'Department Treasury',
      icon: Coins, 
      color: '#10B981', 
      glow: 'rgba(16,185,129,0.15)',
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      lightBg: '#ECFDF5',
      borderColor: '#D1FAE5',
      pct: violations.length > 0 ? Math.min(100, Math.round(((paidFines || 2) / violations.length) * 100)) : 45,
      path: ROUTES.DEPARTMENT.FINES
    },
    { 
      title: 'Pending Case Reviews', 
      value: pendingCases, 
      sub: `${verifiedCases} Cases Verified`, 
      portal: 'Supervisory Review',
      icon: AlertTriangle, 
      color: '#F59E0B', 
      glow: 'rgba(245,158,11,0.15)',
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      lightBg: '#FFFBEB',
      borderColor: '#FEF3C7',
      pct: pendingCases > 0 ? 35 : 5,
      path: ROUTES.DEPARTMENT.VIOLATIONS
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* ── DUAL PORTAL TELEMETRY OVERVIEW CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        
        {/* PORTAL 1: Police Field Enforcement Portal Telemetry */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #BFDBFE',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '0 2px 4px rgba(37,99,235,0.04)',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                <Shield size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                  Police Field Enforcement Portal
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Field Patrol Operations & Live Evidence Detections
                </div>
              </div>
            </div>

            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
              ● LIVE ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>ON-DUTY OFFICERS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563EB', marginTop: '0.1rem' }}>
                {activeOfficersCount} / {officers.length}
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>AI FIELD DETECTIONS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EF4444', marginTop: '0.1rem' }}>
                {violations.length} cases
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>VERIFIED RATIO</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10B981', marginTop: '0.1rem' }}>
                {violations.length > 0 ? Math.round((verifiedCases / violations.length) * 100) : 98}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Live feeds active across patrol motorcycles & ANPR cameras
            </span>
            <button
              onClick={() => { switchPortal('police'); navigate(ROUTES.POLICE.CAPTURE); }}
              style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>Launch Field Camera</span>
              <ExternalLink size={11} />
            </button>
          </div>
        </div>

        {/* PORTAL 2: Department Command Headquarters Telemetry */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #CBD5E1',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '0 2px 4px rgba(15,23,42,0.04)',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                <Building2 size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                  Department Command HQ Portal
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Administrative Governance, Sectors & Analytics
                </div>
              </div>
            </div>

            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              ● HQ OVERSIGHT
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>SECTORS MONITORED</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', marginTop: '0.1rem' }}>
                {sectors?.length || 5} Zones
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>PENALTIES LEVIED</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10B981', marginTop: '0.1rem' }}>
                ₹{totalFineAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Commander: <strong>{user?.name || 'Department Administrator'}</strong>
            </span>
            <button
              onClick={() => navigate(ROUTES.DEPARTMENT.ANALYTICS)}
              style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>View Full Analytics</span>
              <ExternalLink size={11} />
            </button>
          </div>
        </div>

      </div>

      {/* ── TRAFFIC-THEMED KPI METRIC CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => kpi.path && navigate(kpi.path)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: `1px solid ${kpi.borderColor}`,
                padding: '1.15rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 16px ${kpi.glow}`;
                e.currentTarget.style.borderColor = kpi.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = kpi.borderColor;
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {kpi.title}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                    {kpi.value}
                  </div>
                </div>

                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: kpi.lightBg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${kpi.glow}`,
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>

              {/* Progress gauge with traffic colors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${kpi.pct}%`, 
                      height: '100%', 
                      background: kpi.gradient, 
                      borderRadius: '999px',
                      transition: 'width 0.6s ease'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>{kpi.sub}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: kpi.color, backgroundColor: kpi.lightBg, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {kpi.portal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TWO COLUMN SECTION: FIELD ENFORCEMENT UNITS & TRAFFIC SECTOR RADAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '1.25rem' }}>
        
        {/* Real-Time Officer Activity Section (Police Portal Component) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                <Shield size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                  Police Field Enforcement Units
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Active patrol dispatch and live officer telemetry
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(ROUTES.DEPARTMENT.OFFICERS)}
              style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span>Manage Officers</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '0.6rem 0.6rem', fontWeight: 700, borderRadius: '6px 0 0 6px' }}>Officer Name</th>
                  <th style={{ padding: '0.6rem 0.6rem', fontWeight: 700 }}>Jurisdiction Sector</th>
                  <th style={{ padding: '0.6rem 0.6rem', fontWeight: 700 }}>Duty Status</th>
                  <th style={{ padding: '0.6rem 0.6rem', fontWeight: 700 }}>Detections</th>
                  <th style={{ padding: '0.6rem 0.6rem', fontWeight: 700, borderRadius: '0 6px 6px 0' }}>Penalties (₹)</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((off) => (
                  <tr 
                    key={off.id} 
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.65rem 0.6rem' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{off.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Badge: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{off.badge}</span></div>
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', color: '#475569', fontSize: '0.78rem' }}>
                      {off.assignedArea}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: off.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                          color: off.status === 'Active' ? '#15803D' : '#64748B',
                          border: off.status === 'Active' ? '1px solid #BBF7D0' : '1px solid #E2E8F0'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: off.status === 'Active' ? '#16A34A' : '#94A3B8' }} />
                        {off.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', fontWeight: 800, color: '#0F172A' }}>
                      {off.violationsDetected}
                    </td>
                    <td style={{ padding: '0.65rem 0.6rem', fontWeight: 800, color: '#2563EB' }}>
                      ₹{off.finesGenerated.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sector Radar & Incident Summary (Department HQ Component) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                <Flame size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                  Department Sector Density & Radar
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Metropolitan grid congestion & corridor alerts
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(ROUTES.DEPARTMENT.SECTORS)}
              style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span>All Sectors</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {sectorSummary.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                No active traffic sectors recorded yet.
              </div>
            ) : (
              sectorSummary.map((z, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: z.bg,
                    border: `1px solid ${z.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0F172A' }}>
                      {z.zone}
                    </div>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '5px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: '#FFFFFF',
                        color: z.color,
                        border: `1px solid ${z.border}`
                      }}
                    >
                      {z.risk}
                    </span>
                  </div>

                  {/* Micro Density Bar */}
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${z.densityPct}%`, height: '100%', backgroundColor: z.color, borderRadius: '999px' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B' }}>
                    <span>{z.cases} Cases Detected</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Penalties: {z.fine}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
