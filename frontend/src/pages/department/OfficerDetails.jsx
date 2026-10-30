import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  EyeOff,
  KeyRound,
  User,
  Building2,
  Calendar,
  Save,
  Check,
  RotateCw,
  Award,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { officerService } from '../../services/officerService';
import { PlateBadge } from '../../components/common/PlateBadge';

export const DepartmentOfficerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { officers, violations, sectors, refreshSectors, updateOfficerProfile } = useApp();
  const { loginAsOfficer } = useAuth();

  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    designation: '',
    department: '',
    assignedArea: '',
    status: 'Active',
  });

  // 1. Initial sector refresh
  useEffect(() => {
    if (refreshSectors) {
      refreshSectors();
    }
  }, [refreshSectors]);

  // 2. Fetch officer details from local state or direct API
  useEffect(() => {
    let isMounted = true;
    const fetchOfficer = async () => {
      setLoading(true);
      // Check in memory first
      const found = officers.find((o) => o.id === id || o.badge === id || o.username === id);
      if (found) {
        if (isMounted) {
          setOfficer(found);
          setEditForm({
            name: found.name || '',
            phone: found.phone || '',
            designation: found.designation || 'Traffic Sub-Inspector',
            department: found.department || 'Traffic Police Directorate',
            assignedArea: found.assignedArea || (sectors?.[0]?.name ? `${sectors[0].zone ? `${sectors[0].zone} — ` : ''}${sectors[0].name}` : ''),
            status: found.status || 'Active',
          });
        }
      }

      // Also query backend API for latest live state
      try {
        const res = await officerService.getOfficerById(id);
        if (res?.data && isMounted) {
          const liveData = res.data;
          setOfficer(liveData);
          setEditForm({
            name: liveData.name || '',
            phone: liveData.phone || '',
            designation: liveData.designation || 'Traffic Sub-Inspector',
            department: liveData.department || 'Traffic Police Directorate',
            assignedArea: liveData.assignedArea || (sectors?.[0]?.name ? `${sectors[0].zone ? `${sectors[0].zone} — ` : ''}${sectors[0].name}` : ''),
            status: liveData.status || 'Active',
          });
        }
      } catch (err) {
        console.warn('Backend officer lookup info:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOfficer();

    return () => {
      isMounted = false;
    };
  }, [id, officers]);

  // Handle Profile Update
  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    if (!officer?.id || isSaving) return;

    try {
      setIsSaving(true);
      await updateOfficerProfile(officer.id, editForm);
      setOfficer((prev) => ({ ...prev, ...editForm }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update officer profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter violations strictly for this specific officer
  const officerCases = (violations || []).filter((v) => {
    if (!officer) return false;
    const offName = (officer.name || '').trim().toLowerCase();
    const offBadge = (officer.badge || '').trim().toLowerCase();
    const offUser = (officer.username || '').trim().toLowerCase();
    const offId = (officer.id || '').trim().toLowerCase();

    const vName = (v.officerName || '').trim().toLowerCase();
    const vBadge = (v.officerBadge || '').trim().toLowerCase();
    const vId = (v.officerId || '').trim().toLowerCase();

    if (offBadge && vBadge && offBadge === vBadge) return true;
    if (offId && vId && offId === vId) return true;
    if (offName && vName) {
      if (vName === offName) return true;
      if (vName.startsWith(offName) || offName.startsWith(vName)) return true;
    }
    if (offUser && vName && (vName === offUser || vName.startsWith(offUser))) return true;

    return false;
  });

  if (loading && !officer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem' }}>
        <RotateCw size={32} className="spin" color="#2563EB" />
        <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>Loading Officer Profile & Jurisdiction...</span>
      </div>
    );
  }

  if (!officer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <button
          onClick={() => navigate('/department/officers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Officers Roster
        </button>

        <div style={{ backgroundColor: '#FFFFFF', padding: '2.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <AlertTriangle size={40} color="#DC2626" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Officer Profile Not Found</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            No police officer record with ID <code>{id}</code> could be located in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate('/department/officers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Officers Roster
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {saveSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Check size={14} /> Profile & Jurisdiction Updated
            </div>
          )}

          <button
            onClick={() => {
              if (officer && loginAsOfficer) {
                loginAsOfficer(officer);
                navigate('/police/profile');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            }}
          >
            <LogIn size={15} />
            <span>Open in Police Portal Profile</span>
          </button>
        </div>
      </div>

      {/* Main Profile Summary Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              border: '2px solid #BFDBFE',
              letterSpacing: '1px',
            }}
          >
            {officer?.avatar || officer?.name?.slice(0, 2).toUpperCase() || 'PO'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {officer?.name}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: editForm.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                  color: editForm.status === 'Active' ? '#15803D' : '#64748B',
                  fontWeight: 700,
                }}
              >
                {editForm.status}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Badge: <strong style={{ color: '#0F172A' }}>{officer?.badge}</strong></span>
              <span>•</span>
              <span>Designation: <strong style={{ color: '#0F172A' }}>{officer?.designation || 'Traffic Sub-Inspector'}</strong></span>
              <span>•</span>
              <span>Enlisted: {officer?.joiningDate || 'Active Service'}</span>
            </div>
          </div>
        </div>

        {/* Quick Metrics Strictly for this Officer */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>DETECTED OFFENCES</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A' }}>
              {officerCases.length}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>VERIFIED CITATIONS</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16A34A' }}>
              {officerCases.filter(c => c.status === 'Verified' || c.status === 'Fine Generated' || c.status === 'Paid').length}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>TOTAL FINES GENERATED</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#2563EB' }}>
              ₹{officerCases.reduce((sum, c) => sum + (Number(c.fineAmount) || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. Jurisdiction & Profile Editing | 2. Credentials & Enlistment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Dynamic Sector Jurisdiction Assignment */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
              <MapPin size={18} color="#2563EB" />
              <span>Assigned Jurisdiction Sector / Corridor</span>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontWeight: 700,
              }}
            >
              {sectors?.length || 0} Dynamic Sectors
            </span>
          </div>

          <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                ASSIGNED JURISDICTION SECTOR / CORRIDOR (DYNAMIC FROM BACKEND)
              </label>
              <select
                value={editForm.assignedArea}
                onChange={(e) => setEditForm({ ...editForm, assignedArea: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                {sectors && sectors.length > 0 ? (
                  sectors.map((sec) => {
                    const sectorLabel = sec.zone ? `${sec.zone} — ${sec.name}` : sec.name;
                    return (
                      <option key={sec.id || sec.code} value={sectorLabel}>
                        {sectorLabel} {sec.code ? `[${sec.code}]` : ''}
                      </option>
                    );
                  })
                ) : (
                  <option value={officer?.assignedArea || 'Sector 4 Highway Corridor'}>
                    {officer?.assignedArea || 'Sector 4 Highway Corridor (Default)'}
                  </option>
                )}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  DESIGNATION
                </label>
                <select
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Senior Traffic Sub-Inspector">Senior Traffic Sub-Inspector</option>
                  <option value="Traffic Sub-Inspector">Traffic Sub-Inspector</option>
                  <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                  <option value="Head Constable">Head Constable</option>
                  <option value="Patrol Officer">Patrol Officer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  SERVICE STATUS
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Active">Active Duty</option>
                  <option value="Offline">Offline</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  DIRECTORATE / DIVISION
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                  CONTACT PHONE
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Updating...' : 'Save Jurisdiction & Profile'}</span>
            </button>
          </form>
        </div>

        {/* Credentials & Access Information Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
            <KeyRound size={18} color="#2563EB" />
            <span>Officer Authentication & Credentials</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>OFFICER LOGIN USERNAME / ID</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {officer?.username || officer?.badge}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>PORTAL LOGIN PASSWORD</div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {showPassword ? (officer?.password || 'police123') : '••••••••••••'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>BADGE NUMBER</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  {officer?.badge}
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>CONTACT PHONE</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  {officer?.phone || 'Not Registered'}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>SYSTEM RECORD ID</div>
              <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#334155', marginTop: '0.2rem' }}>
                {officer?.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enforcement Cases History Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
              {officer?.name}'s Enforced Violation Cases ({officerCases.length})
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
              Showing only violations issued and enforced by: <strong style={{ color: '#0F172A' }}>{officer?.name} ({officer?.badge})</strong>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: 700 }}>
            {officerCases.length} Cases Enforced
          </span>
        </div>

        {officerCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.85rem' }}>
            No traffic violation enforcement cases recorded under officer {officer?.name} ({officer?.badge}) yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Case ID</th>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Date & Time</th>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Vehicle</th>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Plate</th>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Violation Offence</th>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Fine</th>
                  <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {officerCases.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#0F172A' }}>{v.id}</td>
                    <td style={{ padding: '0.65rem 0.5rem', color: '#64748B' }}>{v.date}, {v.time}</td>
                    <td style={{ padding: '0.65rem 0.5rem', color: '#334155' }}>{v.vehicleType}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      <PlateBadge plate={v.vehicleNumber} size="sm" />
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#DC2626' }}>{v.violationType}</td>
                    <td style={{ padding: '0.65rem 0.5rem', fontWeight: 800, color: '#0F172A' }}>₹{v.fineAmount}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: v.status === 'Verified' ? '#15803D' : v.status === 'Rejected' ? '#DC2626' : '#D97706',
                          backgroundColor: v.status === 'Verified' ? '#DCFCE7' : v.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
