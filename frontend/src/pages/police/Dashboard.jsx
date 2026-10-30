import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Camera,
  UploadCloud,
  Video,
  CheckCircle2,
  Receipt,
  ArrowRight,
  MapPin,
  Eye,
  FileCheck2,
  Sparkles,
  Zap,
  Radio,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';
import { ROUTES } from '../../config/routes';

export const PoliceDashboard = () => {
  const { user } = useAuth();
  const { violations } = useApp();
  const navigate = useNavigate();

  // Real-time dynamic clock
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter for this officer's activity
  const myViolations = violations.filter(
    (v) => !v.officerBadge || v.officerBadge === user?.badge || v.officerName === user?.name
  );
  const verifiedCount = myViolations.filter((v) => v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid').length;
  const challanCount = myViolations.filter((v) => v.challanNo || v.status === 'Fine Generated' || v.status === 'Paid').length;
  const totalFineAmt = myViolations.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);

  const kpis = [
    {
      title: 'Detected Today',
      value: myViolations.length,
      sub: 'Real-time AI camera & radar feeds',
      unit: 'cases',
      icon: Camera,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
      bg: '#EFF6FF',
      glow: 'rgba(37, 99, 235, 0.15)',
      pct: 100,
    },
    {
      title: 'Verified Violations',
      value: verifiedCount,
      sub: `${myViolations.length > 0 ? Math.round((verifiedCount / myViolations.length) * 100) : 100}% Verification Rate`,
      unit: 'confirmed',
      icon: CheckCircle2,
      color: '#16A34A',
      gradient: 'linear-gradient(135deg, #16A34A, #15803D)',
      bg: '#F0FDF4',
      glow: 'rgba(22, 163, 74, 0.15)',
      pct: myViolations.length > 0 ? Math.round((verifiedCount / myViolations.length) * 100) : 95,
    },
    {
      title: 'e-Challans Issued',
      value: challanCount,
      sub: 'MVA 1988 statutory records',
      unit: 'registered',
      icon: FileCheck2,
      color: '#0284C7',
      gradient: 'linear-gradient(135deg, #0284C7, #0369A1)',
      bg: '#F0F9FF',
      glow: 'rgba(2, 132, 199, 0.15)',
      pct: myViolations.length > 0 ? Math.min(100, Math.round((challanCount / myViolations.length) * 100)) : 80,
    },
    {
      title: 'Total Fine Generated',
      value: `₹${totalFineAmt.toLocaleString('en-IN')}`,
      sub: 'Enforcement penalties assessed',
      unit: 'penalties',
      icon: Receipt,
      color: '#E11D48',
      gradient: 'linear-gradient(135deg, #E11D48, #BE123C)',
      bg: '#FFF1F2',
      glow: 'rgba(225, 29, 72, 0.15)',
      pct: 88,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* ── OFFICER COMMAND HERO BANNER ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.35rem 1.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}
      >
        {/* Subtle decorative top traffic accent line */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '3px', 
            background: 'linear-gradient(90deg, #2563EB, #E11D48, #10B981, #2563EB)',
            backgroundSize: '200% 100%',
            animation: 'trafficLineAnim 4s linear infinite'
          }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
              position: 'relative',
            }}
          >
            <Shield size={28} />
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                border: '2px solid #FFFFFF',
                boxShadow: '0 0 8px #16A34A',
                animation: 'pulseGlow 1.8s infinite alternate'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {user?.name || 'Enforcement Officer'}
              </h1>

              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '1px solid #BBF7D0',
                }}
              >
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: '#16A34A',
                    boxShadow: '0 0 6px #16A34A',
                    animation: 'pulseGlow 1.5s infinite alternate'
                  }} 
                />
                ON DUTY
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span>Badge: <strong style={{ fontFamily: 'monospace', color: '#0F172A', fontWeight: 700 }}>{user?.badge || 'TP-0000'}</strong></span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#334155', fontWeight: 600 }}>
                <MapPin size={13} color="#2563EB" /> {user?.assignedArea || 'Patrol Sector'}
              </span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>
                <Clock size={13} color="#64748B" /> {timeStr}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons with Hover Animations */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(ROUTES.POLICE.CAPTURE)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)';
            }}
          >
            <Camera size={16} />
            <span>Capture / Upload</span>
          </button>

          <button
            onClick={() => navigate(ROUTES.POLICE.LIVE_CAMERA)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.color = '#2563EB';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
            }}
          >
            <Video size={16} color="#E11D48" />
            <span>Live Camera Station</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS GRID WITH TRAFFIC ACCENTS & GAUGES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 10px 22px ${kpi.glow}`;
                e.currentTarget.style.borderColor = kpi.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {kpi.title}
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
                    {kpi.value}
                  </div>
                </div>

                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '11px',
                    backgroundColor: kpi.bg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 3px 10px ${kpi.glow}`,
                    flexShrink: 0
                  }}
                >
                  <Icon size={22} />
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
                      transition: 'width 0.8s ease'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>{kpi.sub}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: kpi.color, backgroundColor: kpi.bg, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {kpi.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ENFORCEMENT MODES FAST ACCESS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.1rem' }}>
        
        {/* Card 1: Field Photo */}
        <div
          onClick={() => navigate(ROUTES.POLICE.CAPTURE + '?tab=image')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.35rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#2563EB';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={21} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Upload Field Photo</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Instant snapshot AI inference</div>
              </div>
            </div>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <ArrowRight size={15} />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
            Upload JPG/PNG snapshots from radar guns or patrol smartphone for instant vehicle & plate AI analysis.
          </p>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Process Image Evidence</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Card 2: Recorded Video */}
        <div
          onClick={() => navigate(ROUTES.POLICE.CAPTURE + '?tab=video')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.35rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#7C3AED';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(124, 58, 237, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={21} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Upload Recorded Video</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Dashcam & bodycam parser</div>
              </div>
            </div>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <ArrowRight size={15} />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
            Process dashcam or bodycam footage. Automatically extracts peak violation frame, vehicle class, and license plate.
          </p>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Analyze Video Recording</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Card 3: Live Camera */}
        <div
          onClick={() => navigate(ROUTES.POLICE.LIVE_CAMERA)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.35rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#16A34A';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(22, 163, 74, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={21} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Live Camera Monitoring</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Continuous ANPR radar</div>
              </div>
            </div>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <ArrowRight size={15} />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
            Connect junction camera feed. Continuous AI object tracking, violation auto-capture & spatial de-duplication.
          </p>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Open Live AI Station</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* ── RECENT DETECTED VIOLATIONS TABLE ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.35rem 1.5rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Recent Detected Violations
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Latest traffic enforcement events assigned to your jurisdiction
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.POLICE.MY_VIOLATIONS)}
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#2563EB',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '0.38rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
          >
            <span>View All ({myViolations.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700, borderRadius: '6px 0 0 6px' }}>Case ID</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Time & Date</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Vehicle</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Plate Number</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Violation</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Fine</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Confidence</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.65rem 0.6rem', fontWeight: 700, textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myViolations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No violation cases recorded yet. Use the action buttons above to capture new evidence.
                  </td>
                </tr>
              ) : (
                myViolations.slice(0, 5).map((v) => (
                  <tr 
                    key={v.id} 
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                      {v.id}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', color: '#64748B' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{v.time}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{v.date}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 600, color: '#334155' }}>
                      {v.vehicleType || 'Motorcycle'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <PlateBadge plate={v.vehicleNumber} size="sm" />
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          border: '1px solid #FEE2E2',
                        }}
                      >
                        {v.violationType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: 900, color: '#0F172A' }}>
                      ₹{v.fineAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <span style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.78rem' }}>
                        {(v.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor:
                            v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid'
                              ? '#DCFCE7'
                              : '#FEF3C7',
                          color:
                            v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid'
                              ? '#15803D'
                              : '#B45309',
                          border:
                            v.status === 'Verified' || v.status === 'Fine Generated' || v.status === 'Paid'
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
                          fontSize: '0.74rem',
                          fontWeight: 800,
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
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes trafficLineAnim {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};
export default PoliceDashboard;
